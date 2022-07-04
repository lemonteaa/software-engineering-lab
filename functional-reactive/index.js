import { _extend as extend } from 'util';
import { PullFRP, PushFRP } from './src/frp.js';

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
