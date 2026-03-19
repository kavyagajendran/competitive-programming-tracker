export const fetchAllContests = async () => {
    try {
        // 1. Fetch Backend Contests (Includes LeetCode, CodeChef, and now fixed Codeforces)
        let backendContests = [];
        try {
            const res = await fetch('/api/contests');
            if (res.ok) {
                backendContests = await res.json();
            } else {
                console.error("Backend fetch failed:", res.status);
            }
        } catch (e) {
            console.error("Backend fetch error:", e);
        }

        // 2. We can still try to fetch extra CF contests if backend missed some, 
        // but the current implementation filters them out. 
        // Let's change it so we merge and deduplicate by name or ID.

        // Actually, the user wants "all 3 fields contests", and the backend is now fixed.
        // Let's just return backend contests as the source of truth for simplicity and reliability.

        // If we want to keep the client-side fetch as a fallback, we should only add if not present.
        // For now, let's just use the backend data which we know is working and bypasses the proxy/timeout issues.

        const allContests = backendContests;

        // 3. Sort by Start Time
        allContests.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        return allContests;

    } catch (e) {
        console.error("Global fetch error:", e);
        return [];
    }
};
