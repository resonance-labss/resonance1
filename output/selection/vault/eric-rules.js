/* Denis: shows how each funded expense in the current proposal would be written as a Rialo time-triggered transfer.
   Read-only. Nothing is scheduled, signed or sent from this page. */
(()=>{'use strict';
const $=id=>document.getElementById(id);if(!$('allocation-details'))return;
const money=n=>(n/100).toFixed(2);
const box=document.createElement('section');box.id='rialo-schedule';box.className='rialo-schedule';
box.innerHTML='<h3>As Rialo scheduled transfers</h3><p class="muted">Rialo has native timers: a rule can wait for a date and then run its transfer without an outside bot. This is how the funded expenses in this proposal would read as rules. When the day comes, the transfer still needs enough funds. Nothing is scheduled from this page; Rialo has no public network yet and these are Demo RLO.</p><ol id="rialo-schedule-list"></ol>';
$('allocation-details').after(box);
window.addEventListener('resonance:eric-report',event=>{
 const {input,names,result}=event.detail,list=$('rialo-schedule-list'),day={};list.replaceChildren();
 for(const bill of input.bills)day[bill.id]=bill.day;
 const bills=result.decisions.filter(d=>d.kind==='bill').sort((a,b)=>day[a.id]-day[b.id]);
 const item=(text,cls)=>{const li=document.createElement('li');if(cls)li.className=cls;li.textContent=text;list.append(li);};
 if(!bills.length)item('No expenses in this proposal, so there is nothing to schedule.');
 for(const d of bills)
  if(d.status==='earmarked')item('Day '+day[d.id]+' of this period → transfer '+money(d.allocated)+' Demo RLO to “'+names[d.id]+'”, once.');
  else item('“'+names[d.id]+'” is not funded in this proposal, so no rule is written.','missing');
});
})();
