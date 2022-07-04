# Functional Reactive Programming

Implements the core pull based vs push based algorithms to reactively update values, given a dependency graph.

The algo is in `src/frp.js`.

## How the algorithm works

In short, pull based one pull latest value from the dependent/upstream nodes, and is an on demand/lazy evaluation. In contrast, push based one updates all affected values in one go, by pushing the updated value downstream towards all possible affected nodes.

In both case topological sorting is the key as it let us handle the problem of "glitches" - by always starting from the node earlier in dependency order, we ensure that by the time we get to the later ones, all its dependent values would have been updated if necessary. The ingredient in pull/push is then to intelligent select only a subset of all nodes to reevaluate (if performance is not a concern, just reevaluate all nodes one by one, according to dependency order would work).

It is also interesting to note a duality: push based algorithm is essentially BFS, while pull based one is DFS.

## Technical Notes

- Since this is a poc/quick and dirty demo, we did not vet the quality of libraries used to supply lower level auxiliary functions.

## TODO

- [ ] Cleanup the tests
- [ ] More principled approach to the data format
- [ ] Higher/User level interface?

## References

TODO
