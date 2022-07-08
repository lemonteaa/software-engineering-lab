package com.lemontea.lsmtree;

import java.util.concurrent.ConcurrentSkipListMap;

public class KVStore {
    private ConcurrentSkipListMap<String, Object> inMemoryMap;
    private int persistThreshold = 100;
    private boolean persistInProgress = false;

    public KVStore() {
        inMemoryMap = new ConcurrentSkipListMap<String, Object>();
    }

    public Object get(String key) {
        return inMemoryMap.get(key);
    }

    public synchronized void set(String key, Object value) throws InterruptedException {
        while (persistInProgress) {
            wait();
        }
        inMemoryMap.put(key, value);
        if (inMemoryMap.size() >= persistThreshold) {
            persistInProgress = true;
            //TODO: do the persistance

            persistInProgress = false;
            notifyAll();
        }
    }
}
