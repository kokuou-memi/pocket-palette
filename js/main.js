const memberGrid=document.getElementById("memberGrid");

function renderMembers(liveIds=[]){

memberGrid.innerHTML="";

members.forEach(member=>{

const live=liveIds.includes(member.channelId);

const a=document.createElement("a");

a.href=member.youtube;

a.target="_blank";

a.className="member";

if(!live)a.classList.add("offline");

a.innerHTML=`
${live?'<div class="live-badge">LIVE</div>':''}
<img src="${member.image}">
<span>${member.name}</span>
`;

memberGrid.appendChild(a);

});

}

renderMembers();