import { useEffect, useState, useCallback } from 'react';

export default function useFetch(fetcher, deps = []) {
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

const run = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
    const res = await fetcher(...args);
    setData(res);
    setLoading(false);
    return res;
    } catch (err) {
    setError(err);
    setLoading(false);
    throw err;
    }
}, deps);

useEffect(() => {
    // if fetcher returns directly, attempt to run once
    run().catch(() => {});
}, [run]);

return { data, setData, loading, error, run };
}
