import { TopologicalSort } from "topological-sort";
import { UniquePriorityQueue } from './utils.js';

export { FRPBase, PullFRP, PushFRP }

class FRPBase {
    constructor(nodes, edges) {
        //this.nodes = nodes;
        this.sortOp = new TopologicalSort(nodes);
        edges.forEach((edge) => { this.sortOp.addEdge(edge[0], edge[1]); });
        const sorted = this.sortOp.sort();
        this.nodes = sorted;
        edges.forEach((e) => {
            const [from, to] = e;
            const toNode = this.nodes.get(to);
            if (!toNode.parents) toNode.parents = [];
            toNode.parents.push(from);
        });
        this.sortedKeys = [...sorted.keys()];
        this.sortedKeys.forEach((k, i) => { this.nodes.get(k).order = i; });
    }

    _gatherInputs(inputNames) {
        var inputs = {};
        inputNames.map((p) => {
            const node = this.nodes.get(p).node;
            const v = (node.isValueNode) ? node.val : node.cachedVal;
            return [p, v];
        }).forEach((x) => {
            const [p, v] = x;
            inputs[p] = v;
        });
        return inputs;
    }
}

class PushFRP extends FRPBase {
    constructor(nodes, edges) {
        super(nodes, edges);
    }
    
    fullUpdate(updatedNodes) {
        //Step 1: Find all directly affected nodes
        var affected = new Set();
        updatedNodes.forEach((n) => {
            const xs = [...this.nodes.get(n).children.keys()];
            xs.forEach((x) => { affected.add(x); });
        });
        const c = Array.from(affected).map((n) => { 
            return [n, this.nodes.get(n).node, this.nodes.get(n).order];
        });
        var processing = new UniquePriorityQueue(c);

        while (!processing.isEmpty()) {
            const [n, node, _] = processing.dequeue();
            //console.log(this.nodes.get(n).children);
            const inputs = this._gatherInputs(this.nodes.get(n).parents);
            node.cachedVal = node.fn(inputs);
        }
    }
};

class PullFRP extends FRPBase {
    constructor(nodes, edges) {
        super(nodes, edges);

        this.updatedNodes = new Set();
    }

    updateOne(n) {
        const curNode = this.nodes.get(n);
        if (curNode.node.isValueNode) return curNode.node.val;
        if (curNode.node.updated) return curNode.node.cachedVal;

        console.log(curNode);

        var dependNodes = curNode.parents.map((m) => {
            return [m, this.nodes.get(m).order];
        });
        dependNodes.sort((a, b) => { return a[1] - b[1]; });
        console.log(dependNodes);
        dependNodes.forEach(([n, ]) => {
            this.updateOne(n);
        });

        const inputs = this._gatherInputs(curNode.parents);
        curNode.node.cachedVal = curNode.node.fn(inputs);
        curNode.node.updated = true;

        this.updatedNodes.add(n);

        return curNode.node.cachedVal;
    }

    reset() {
        this.updatedNodes.forEach((n) => {
            this.nodes.get(n).node.updated = false;
        });
        this.updatedNodes.clear();
    }
}
