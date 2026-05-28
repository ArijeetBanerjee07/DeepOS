export const calculateFlowchartLayout = (nodes: any[], edges: any[]) => {
  const levels: Record<string, number> = {};
  const inDegree: Record<string, number> = {};
  const adj: Record<string, string[]> = {};

  nodes.forEach(n => {
    levels[n.id] = 0;
    inDegree[n.id] = 0;
    adj[n.id] = [];
  });

  edges.forEach(e => {
    // We map ai-source to ai-target based on the returned edges.
    // If edges are raw from Groq, they might just have source and target.
    const s = e.source.toString();
    const t = e.target.toString();
    if (!adj[s]) adj[s] = [];
    adj[s].push(t);
    if (inDegree[t] === undefined) inDegree[t] = 0;
    inDegree[t]++;
  });

  const queue: string[] = [];
  nodes.forEach(n => {
    // wait, the passed nodes already have ai- prefix, so we use their actual id
    if ((inDegree[n.id] || 0) === 0) queue.push(n.id);
  });

  // Fallback for circular or disconnected graphs
  if (queue.length === 0 && nodes.length > 0) {
    queue.push(nodes[0].id);
  }

  while(queue.length > 0) {
    const curr = queue.shift()!;
    (adj[curr] || []).forEach(target => {
      levels[target] = Math.max(levels[target] || 0, (levels[curr] || 0) + 1);
      inDegree[target]--;
      if (inDegree[target] === 0) {
        queue.push(target);
      }
    });
  }

  const levelGroups: Record<number, string[]> = {};
  nodes.forEach(n => {
    const lvl = levels[n.id] || 0;
    if (!levelGroups[lvl]) levelGroups[lvl] = [];
    levelGroups[lvl].push(n.id);
  });

  const layout: Record<string, {x: number, y: number}> = {};
  
  Object.keys(levelGroups).forEach(lvlStr => {
    const lvl = parseInt(lvlStr);
    const nodesInLvl = levelGroups[lvl];
    const total = nodesInLvl.length;
    // We want to center it horizontally. window.innerWidth might not be available in SSR, but it's fine here.
    const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 500;
    nodesInLvl.forEach((nodeId, idx) => {
      layout[nodeId] = {
        x: (idx - (total - 1) / 2) * 350 + (centerX - 150), // 350 spacing, centered
        y: lvl * 250 + 100 // 250 vertical spacing
      };
    });
  });

  return layout;
};
