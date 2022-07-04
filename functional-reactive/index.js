import { TopologicalSort } from "topological-sort";
import PriorityQueue from "js-priority-queue";
import { _extend as extend } from 'util';


class UniquePriorityQueue {
    constructor(items) {
        this.queue = new PriorityQueue({ initialValues: items, comparator: (a, b) => { return a[2] - b[2]; } });
        this.myset = new Set(items.map((item) => { return item[0]; }));
    }
    
    enqueue(x) {
        if (!this.myset.has(x[0])) {
            this.queue.enqueue(x);
            this.myset.add(x[0]);
        }
    }
    
    dequeue() {
        const res = this.queue.dequeue();
        this.myset.delete(res[0]);
        return res;
    }
    
    isEmpty() {
        return this.myset.size == 0;
    }
};

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



const testNode1_initial = { isValueNode: true, val: 12 };
const testNode2_initial = { isValueNode: true, val: 31 };
const testNode3_initial = { isValueNode: false, fn: (v) => { const { test1, test2 } = v; return test1 + test2; } };
const testNode4_initial = { isValueNode: true, val: 8 };
const testNode5_initial = { isValueNode: false, fn: (v) => { const { test1, test3, test4 } = v; return test1 - test3*test4; } };

var testNode1 = extend({}, testNode1_initial);
var testNode2 = extend({}, testNode2_initial);
var testNode3 = extend({}, testNode3_initial);
var testNode4 = extend({}, testNode4_initial);
var testNode5 = extend({}, testNode5_initial);

function reset_Tests() {
    testNode1 = extend({}, testNode1_initial);
    testNode2 = extend({}, testNode2_initial);
    testNode3 = extend({}, testNode3_initial);
    testNode4 = extend({}, testNode4_initial);
    testNode5 = extend({}, testNode5_initial);
}
var myTest = new Map([
    ['test5', testNode5],
    ['test4', testNode4],
    ['test3', testNode3],
    ['test1', testNode1],
    ['test2', testNode2]
]);
const myTestEdges = [
    ['test1', 'test3'],
    ['test2', 'test3'],
    ['test1', 'test5'],
    ['test3', 'test5'],
    ['test4', 'test5']
];
myTest.get('test3');
const o1 = new PushFRP(myTest, myTestEdges);
const what1 = o1.nodes;;
testNode3.fn({ test1: 1, test2: 4 });
o1.fullUpdate(['test4', 'test1']);;
console.log(o1.nodes);

reset_Tests();

const o2 = new PullFRP(myTest, myTestEdges);
//testNode1.val = -10;
myTest.get('test1').val = -10;
const ans2 = o2.updateOne('test5');
console.log(o2.nodes);
console.log("Answer is " + ans2);

myTest.get('test4').val = 1;
o2.reset();
const ans3 = o2.updateOne('test5');
console.log(o2.nodes);
console.log("Answer is " + ans3);