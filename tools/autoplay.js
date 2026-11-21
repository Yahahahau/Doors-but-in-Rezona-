(async () => {
  const g = __game; const errs = []; const log = [];
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const T = (o) => o.type;
  for (let step = 0; step < 110; step++) {
    const r = g.rooms.current;
    if (r.noExit) { log.push('final ' + r.door); break; }
    // open every container, collect every pickup in this room
    for (const o of [...r.objects]) if (['dresser','drawerTable','chest'].includes(T(o)) && !o.opened) { g.player.x = o.x; g.updateTarget(); if (g.target === o) g.interact(); }
    await sleep(5);
    for (const o of [...r.objects]) if (T(o) === 'pickup') { g.player.x = o.x; g.updateTarget(); if (g.target && T(g.target)==='pickup') g.interact(); }
    const lever = r.objects.find(o => T(o) === 'lever');
    if (lever) { g.player.x = lever.x; g.updateTarget(); g.interact(); for (let i=0;i<40;i++){ g.rooms.update(0.05,g);} }
    // walk to the exit door (blocked by solids) and open it
    g.player.x = r.x1 - 120; g.player.vx = 0;
    for (let i = 0; i < 90; i++) { g.player.update(1/30, {left:false,right:true,crouch:false}, g.rooms.solids()); }
    g.updateTarget();
    if (!g.target || T(g.target) !== 'exitDoor') { errs.push(`door ${r.door}: exit not targetable at x=${g.player.x.toFixed(0)} (x1=${r.x1}) target=${g.target&&T(g.target)} prompt=${g.prompt&&g.prompt.text}`); break; }
    g.interact();
    if (r.exit.state !== 'opening') { errs.push(`door ${r.door}: exit did not open: ${g.prompt && g.prompt.text} type=${r.type} locked=${r.exit.locked}`); break; }
    for (let i = 0; i < 30; i++) g.rooms.update(0.05, g);
    for (let i = 0; i < 160; i++) { g.player.update(1/30, {left:false,right:true,crouch:false}, g.rooms.solids()); g.rooms.update(1/30, g); }
    if (g.rooms.cur !== r.door + 1) { errs.push(`door ${r.door}: did not enter next (cur=${g.rooms.cur}, x=${g.player.x.toFixed(0)})`); break; }
    log.push(r.door + ':' + r.type + (r.dark?'*':'') + (r.spec.exit.locked?'L':''));
  }
  return { errs, reached: g.rooms.cur, loaded: g.rooms.rooms.map(r => r.door), gold: g.inv.gold, inv: g.inv.slots.map(s => s && s.id + 'x' + s.count), log: log.join(' ') };
})()
