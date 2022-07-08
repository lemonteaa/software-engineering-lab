package com.lemontea.lsmtree;

import java.util.List;

import com.lemontea.lsmtree.data.LSMTreeHierarchy;

public class Compactor implements Runnable {
    private LSMTreeHierarchy theHierarchy;

    @Override
    public void run() {
        // TODO Auto-generated method stub
        
    }

    public void compactLSMTree() {
        int curLevel = 0;
        boolean needContinue = true;
        while (needContinue) {
            List<Object> runs = theHierarchy.getAllRunsInLevel(curLevel);
            Object newRun = mergeTrees(runs);
            theHierarchy.add(newRun, curLevel + 1, theHierarchy.getNumRunByLevel(curLevel + 1));
            theHierarchy.deleteLevel(curLevel);
            curLevel++;
            needContinue = (theHierarchy.getNumRunByLevel(curLevel) > mergeThreshold);
        }
    }
    
    public Object mergeTrees(List<Object> trees) {
        //TODO
    }
}
