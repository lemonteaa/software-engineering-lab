//const { TopologicalSort } = require("topological-sort");;

import { TopologicalSort } from "topological-sort";

var variablesObj = { Hello: "foo" };
var mixinsObj = { test: true, val: 123 };
var blocksObj = { hi: "bye", yes: "no" };
var blockModObj1 = {};
var blockModObj2 = { why: false, yet: "testing", val: 42 };;
// you can pass nodes as a map into constructor:
const nodes = new Map();
nodes.set('variables', variablesObj);
nodes.set('mixins', mixinsObj);
const sortOp = new TopologicalSort(nodes);
 
// ...or add them to existing object instance with addNode() or addNodes():
sortOp.addNode('block', blocksObj);
sortOp.addNodes(new Map([
    ['block_mod_val1', blockModObj1],
    ['block_mod_val2', blockModObj2]
]));
 
// then you should add adges between nodes
sortOp.addEdge('variables', 'mixins'); // from, to
sortOp.addEdge('mixins', 'block');
sortOp.addEdge('variables', 'block');
sortOp.addEdge('block', 'block_mod_val2');
sortOp.addEdge('block', 'block_mod_val1');;
const sorted = sortOp.sort();
const sortedKeys = [...sorted.keys()];;
const { node: resA, children: resB } = sorted.get('variables');;
sorted;
//const { PriorityQueue } = require('js-priority-queue');

import PriorityQueue from "js-priority-queue";
//const { PriorityQueue } = pkg;
//console.log(new pkg.BinaryHeapStrategy({ initialValues: [1, 2, 3] }));
//console.log(new pkg({ initialValues: [ 1, 2, 3 ]}));


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
class PushFRP {
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
    
    fullUpdate(updatedNodes) {
        //Step 1: Find all directly affected nodes
        var affected = new Set();
        updatedNodes.forEach((n) => {
            const xs = [...this.nodes.get(n).children.keys()];
            xs.forEach((x) => { affected.add(x); });
        });
        const c = Array.from(affected).map((n) => { return [n, this.nodes.get(n).node, this.nodes.get(n).order]; });
        var processing = new UniquePriorityQueue(c);
        //return processing.dequeue();
        while (!processing.isEmpty()) {
            const [n, node, _] = processing.dequeue();
            //console.log(this.nodes.get(n).children);
            var inputs = {};
            this.nodes.get(n).parents.map((p) => {
                const node = this.nodes.get(p).node;
                const v = (node.isValueNode) ? node.val : node.cachedVal;
                return [p, v];
            }).forEach((x) => {
                const [p, v] = x;
                inputs[p] = v;
            })
            node.cachedVal = node.fn(inputs);
        }
    }
};
var testNode1 = { isValueNode: true, val: 12 };
var testNode2 = { isValueNode: true, val: 31 };
var testNode3 = { isValueNode: false, fn: (v) => { const { test1, test2 } = v; return test1 + test2; } };
var testNode4 = { isValueNode: true, val: 8 };
var testNode5 = { isValueNode: false, fn: (v) => { const { test1, test3, test4 } = v; return test1 - test3*test4; } };;
const myTest = new Map([
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
