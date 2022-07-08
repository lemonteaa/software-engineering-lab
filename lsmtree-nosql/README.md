# Log-Structured Merge Tree in NoSQL

A LSMTree is a hybrid data structure designed to combine the strength of an append-only log (easier concurrency) with that of a traditional B-Tree index (efficient query, support range query). First (?) proposed by Google in the landmark BigTable paper, it has since then become a pivotal data structure for much of the key-value store type database in the NoSQL world.

## How it works

This can be a tricky thing as the devil's in the detail, and many online articles only cover some particular aspects of LSMTree. Roughly speaking:

*The raw data structure:*
- A LSMTree is a collection of slab. Each slab contains a collection of record/key-value pairs. The slab have its own internal data structure to support efficient query (more detail later).
- Each slab is assigned two number: the "level" it is in, and the "run" within a "level".
- There is the same maximum number of allowed "run" within each "level". (Exception: "Level 0" must have only 1 "run")
- There is a number of "level" - data from upper level (lower numbered one) take percedance. For example, if there's an entry for the key "42" in both level 2 and 5, then the record in level 2 wins.
- Similarly, there is also a number of "runs" in each level, and within the same layer, higher numbered run take percedance.
- In general, each Slab is stored as a file on disk using a format called `SSTable`. The keys are sorted, and there is additionally a B-Tree indexing into these key. This allow efficient query within the same slab.
- An exception is made for level 0 as it resides in memory only. It can be stored using a Binary Search Tree(BST).

*Insertion*
- To insert a key, just add it the the level 0 in-memory, using the `add()` method of the BST.
- But we need it to be durable - survive if the computer crash in the middle. To achieve this use a Write-ahead Log (WAL) file. Write the record to that file first, then add in memory. The WAL is an append-only journal file. Hence in case of crash, we can recover by replaying the WAL to reconstruct the BST.
- Whenever the BST reach some size threshold, we flush/persist it to the disk by converting it into a `SSTable` format. This can be done easily because the BST ensure that it is key-sorted in an online manner as it keep adding key to it.
- It is added as the highest numbered run in layer 1.
- Notice that the slabs, once written to the disk for the first time, remains immutable - for updating key, what we did is "overwrite" it by adding the same record in a different slab that has a higher pirority. Thus we in effect have an append-only log in the sequence of slabs.

*Compaction*
- The reason for the numering scheme is because we need a way to compact the slabs, otherwise, its append-only nature will ensure that our DB size keep increasing until disk space run out.
- During compaction, a number of slabs are combined into a single one. This is done by a multi-way sorted merge and is linear in runtime.
- As to how this keep the space usage in check: if we have updated the same key multiple times, it could have appears multiple times in different slabs. During this merge, it collapse back into a single record. (Hence the multi-way sorted merge algorithm in last point need to take special care to always retain only the instance with higher percedence for this kind of record)
- Compaction can be run concurrently with normal DB operations.
- There are many different scheme for how to schedule compaction, and *which* slabs to combine.
- One example: Slabs in each level increases in size by a constant factor compared to previous level. Merge happen greedily from the level 1 - the new produced slab is placed onto level 2, and the slabs in level 2 are merged (and placed in level 3) as well if the number of run in that level reach the threshold, and so on.

*Bloom filter*
- A big drawback of the design so far is that - if we query a non-existent key, we would need to query all the way to the last slab before we can be sure that it doesn't exist.
- Hence we also add a bloom filter - it is a probabilistic data structure that can filter out such non-existent keys.
- Being probabilistic it doesn't always succeed. But if it work most of the time then that's already a big improvement.
- In particular, it must not have false-negative - answering "doesn't exists" when it actually does. But a small rate of false-positive is allowed, and we should tune the data strcuture's parameter to optimize this.

*Other note*
- Deletion isn't directly addressed. One way to implement it is through the use of "tomb-stone" entry.

## Reference
TODO


