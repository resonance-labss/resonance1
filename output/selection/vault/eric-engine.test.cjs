const assert=require('node:assert/strict'),{plan}=require('./eric-engine.js');
const base={cash:10000,income:0,reserve:2000,savings:5000,topUp:{enabled:true,cap:2000,billIds:['education']},bills:[{id:'rent',amount:5000,priority:1,day:1},{id:'education',amount:4000,priority:2,day:5}],goals:[{id:'trip',balance:0,target:10000,cap:1000,priority:1}]};
const before=JSON.stringify(base),p=plan(base);assert.equal(JSON.stringify(base),before);assert.equal(p.savingsUsed,1000);assert.equal(p.operating,2000);assert.equal(p.earmarked,9000);assert.equal(p.paid,false);assert.equal(p.startingTotal,p.endingTotal);
const denied=plan({...base,topUp:{...base.topUp,enabled:false}});assert.equal(denied.decisions[1].shortfall,1000);assert.equal(denied.goalAdded,0);assert.equal(denied.savings,5000);
const under=plan({...base,cash:1000});assert.equal(under.reserveDeficit,1000);assert.equal(under.earmarked,0);assert.equal(under.savingsUsed,0);
const goals=plan({...base,bills:[],topUp:{enabled:false,cap:0,billIds:[]},goals:[{id:'done',balance:1000,target:1000,cap:1000,priority:1},{id:'next',balance:0,target:2000,cap:2000,priority:2}]});assert.equal(goals.goalAdded,2000);assert.equal(goals.decisions[0].allocated,0);
const shared=plan({...base,bills:[...base.bills,{id:'extra',amount:2000,priority:3,day:6}],topUp:{enabled:true,cap:2000,billIds:['education','extra']}});assert.equal(shared.savingsUsed,1000);assert.equal(shared.decisions[2].status,'unfunded');
assert.throws(()=>plan({...base,cash:1.5}));assert.throws(()=>plan({...base,topUp:{...base.topUp,billIds:['missing']}}));
for(let i=0;i<300;i++){const result=plan({...base,cash:i*100});assert.equal(result.startingTotal,result.endingTotal);assert(result.operating>=0);assert(result.savings>=0);assert(result.savingsUsed<=2000);}
console.log('PASS Denis conservation, consent boundaries, shared cap, reserve deficit, completed goals, shortfalls and immutable inputs.');
