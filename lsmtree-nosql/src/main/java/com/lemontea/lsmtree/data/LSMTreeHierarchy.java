package com.lemontea.lsmtree.data;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.javatuples.Pair;

public class LSMTreeHierarchy {
    private Map<Pair<Integer, Integer>, Object> hierarchy;
    private int numLevels;
    private List<Integer> numRuns;
    //private int curLevel, curRun;

    public Object get(int level, int run) {
        return hierarchy.get(Pair.with(level, run));
    }

    public void add(Object slab, int level, int run) {
        hierarchy.putIfAbsent(Pair.with(level, run), slab);
        numRuns.set(level, numRuns.get(level) + 1);
    }

    public int getNumRunByLevel(int level) {
        return numRuns.get(level);
    }
    public List<Object> getAllRunsInLevel(int level) {
        List<Object> result = new ArrayList<Object>();
        for (int i = 0; i < numRuns.get(level); i++) {
            Object slab = hierarchy.get(Pair.with(level, i));
            result.add(slab);
        }
        return result;
    }

    public void deleteLevel(int level) {
        //TODO
    }
}
