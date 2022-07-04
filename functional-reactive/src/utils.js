import PriorityQueue from "js-priority-queue";

export class UniquePriorityQueue {
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
}
