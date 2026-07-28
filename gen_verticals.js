#!/usr/bin/env node
// 六学科垂直版批量生成器: 读 verticals/courses/policies/assets/skills -> 渲染8板块模板 -> 输出6个HTML
// 8板块: Hero / AI4S范畴 / 基础技巧 / 科研设计 / 场景诊断 / 政策指引 / 适用工具 / 课程案例
const fs=require('fs'),path=require('path');
const DIR=__dirname;
// hex颜色转rgba字符串
function hex2rgba(hex,a){
  const h=hex.replace('#','');
  const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
  return `rgba(${r},${g},${b},${a})`;
}
// eval 注入数据到全局
function load(file,varName){
  const txt=fs.readFileSync(path.join(DIR,'data/'+file),'utf-8');
  global[varName]=undefined;
  eval(txt.replace('const '+varName,'global.'+varName));
}
load('verticals.js','VERTICALS');
load('policies.js','POLICIES');
load('courses.js','COURSES');
load('assets.js','ASSETS');
load('skills.js','SKILLS_DB');
load('tutorials.js','TUTORIALS');

// 学科 key -> 学科名(skills/assets 的学科标签)
const KEY2DISC={life:"生命科学",material:"物质科学",engineering:"工程技术",earth:"地球环境",math:"数学量子",cross:"交叉通用"};
// 学科关键词(政策匹配)
const DISCKW={life:["生命科学","生命","生物","医药","蛋白","药物","基因"],material:["物质科学","材料","化学","能源","分子"],engineering:["工程技术","制造","工程","工业","光学"],earth:["地球环境","气象","海洋","地球","环境","地震"],math:["数学量子","数学","量子","计算","算力"],cross:[]};
// 课程标签 -> 学科 key
const TAG2KEY={"材料":"material","计算化学":"material","EDA":"engineering","气象":"earth","DrClaw":"cross","教学":"cross","产学研沙龙":"cross"};

function skillsFor(disc){
  return SKILLS_DB.skills.filter(s=>s.学科===disc||(disc==="交叉通用"&&(s.学科==="交叉通用"||s.学科==="其他")));
}
function assetsFor(disc){
  const all=[...(ASSETS.智能体||[]),...(ASSETS.工具链||[]),...(ASSETS.模型||[])];
  return all.filter(a=>a.学科===disc||(disc==="交叉通用"&&(a.学科==="通用"||a.学科==="其他")));
}
function coursesFor(key){
  return COURSES.filter(c=>TAG2KEY[c.标签]===key);
}
function policiesFor(disc){
  const kws=DISCKW[Object.keys(KEY2DISC).find(k=>KEY2DISC[k]===disc)]||[];
  if(kws.length===0) return POLICIES.政策.slice(0,4); // 交叉通用取通用政策
  return POLICIES.政策.filter(p=>{
    const blob=((p.重点领域||[]).join(""))+p.标题+((p.匹配标签||[]).join(""));
    return kws.some(k=>blob.includes(k));
  });
}

// 客户端脚本(场景卡 + 诊断交互), __KEY__ 替换
const CLIENT=String.raw`
const V=VERTICALS["__KEY__"],S=V.场景,POL=POLICIES_JSON;
const grid=document.getElementById('sceneGrid'),detail=document.getElementById('sceneDetail');
S.forEach(s=>{grid.insertAdjacentHTML('beforeend',
  '<div class="scene" data-id="'+s.id+'"><div class="ic">'+s.图标+'</div><h3>'+s.名称+'</h3>'+
  '<div class="one">'+s.一句话+'</div><div class="who">👥 '+s.适合谁+'</div>'+
  '<div class="tools-count">▸ '+s.代表工具.length+' 类核心工具/模型</div>'+
  '<div class="hook">"'+s.营销钩子+'"</div></div>');});
grid.addEventListener('click',e=>{const card=e.target.closest('.scene');if(!card)return;
  const s=S.find(x=>x.id===card.dataset.id);
  const rows=s.代表工具.map(t=>'<div class="tool-row">'+
    '<div class="nm tool-link" data-tool="'+t.名称+'">'+t.名称+'<span class="tag">'+t.类型+' · '+t.机构+'</span></div>'+
    '<div class="val">'+t.价值+'</div>'+(t.热度?'<div class="heat">'+t.热度+'</div>':'<div class="heat"></div>')+'</div>').join('');
  detail.innerHTML='<div class="sd-head"><h3>'+s.图标+' '+s.名称+'</h3><button class="sd-close">收起</button></div>'+
    '<div style="color:#6b7280;font-size:15px">'+s.一句话+'</div>'+
    '<div class="sd-pain">😖 <b>典型痛点：</b>'+s.痛点+'</div>'+rows+
    '<div class="sd-hook">💬 '+s.营销钩子+'</div>';
  detail.classList.add('open');detail.scrollIntoView({behavior:'smooth',block:'nearest'});});
detail.addEventListener('click',e=>{if(e.target.classList.contains('sd-close'))detail.classList.remove('open')});
const answers={};
document.querySelectorAll('.opts').forEach(box=>{box.addEventListener('click',e=>{
  if(!e.target.classList.contains('opt'))return;
  box.querySelectorAll('.opt').forEach(o=>o.classList.remove('sel'));
  e.target.classList.add('sel');answers[box.dataset.q]=e.target.dataset.v||e.target.textContent;
  document.getElementById('genBtn').disabled=Object.keys(answers).length<3;});});
const DISCKW=__DISCKW_JSON__;
function advice(stuck){
  if(/AI|人才/.test(stuck))return "申报'百团百项'需 AI+领域+工程 三人组--平台可帮你对接";
  if(/计算|资源|性能|算力/.test(stuck))return "对接'科学智能开放社区算力支持计划'(免费/补贴算力)或'AI+制造'算力补贴";
  if(/试错|数据|检索|处理/.test(stuck))return "用AI主动学习/数据库工具,把盲目试错变成定向搜索";
  return "引入对应AI工具,逐步替换低效环节";}
document.getElementById('genBtn').addEventListener('click',()=>{
  const sc=S.find(x=>x.id===answers["场景"])||S[0];
  const stuck=answers["卡点"],age=parseInt(answers["年龄"]);
  document.getElementById('repPain').innerHTML=
    '<b>🎯 你的场景：'+sc.名称+'</b><br>😖 痛点:'+sc.痛点+'<br>💡 针对"'+stuck+'"：'+advice(stuck);
  document.getElementById('repTools').innerHTML=sc.代表工具.map(t=>
    '<div class="tool-row"><div class="nm tool-link" data-tool="'+t.名称+'">'+t.名称+'<span class="tag">'+t.类型+' · '+t.机构+'</span></div>'+
    '<div class="val">'+t.价值+'</div>'+(t.热度?'<div class="heat">'+t.热度+'</div>':'<div class="heat"></div>')+'</div>').join('');
  const pols=POL.政策.map(p=>{let s=0;const blob=(p["重点领域"]||[]).join("")+p["标题"]+(p["匹配标签"]||[]).join("");
    if(p["状态"]==="申报中")s+=5;else if(p["状态"]==="已截止")s-=2;
    if(DISCKW.some(k=>blob.includes(k)))s+=6;
    if(age<=40&&(blob.includes("青年")||blob.includes("百团百项")))s+=6;
    return {s,p};}).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,3);
  document.getElementById('repPols').innerHTML=pols.map(({p})=>
    '<div class="tool-row"><div class="nm" style="min-width:0;flex:1">'+p["标题"]+
    '<span class="tag">'+p["状态"]+' · '+p["申报时间窗"]+'</span></div>'+
    '<div class="val" style="color:var(--pri);font-weight:600">'+(p["资助强度"]||"").slice(0,36)+'</div></div>').join('');
  let warn=age<=40?'💡 你是青年科学家(≤40岁)：优先准备每年5月"百团百项"，需AI+领域+工程三人组。':"";
  document.getElementById('repWarn').innerHTML=warn?'<div class="warntip">'+warn+'</div>':"";
  const rep=document.getElementById('report');rep.style.display='block';
  rep.scrollIntoView({behavior:'smooth',block:'start'});});
document.getElementById('leadForm').addEventListener('submit',e=>{
  e.preventDefault();
  const leads=JSON.parse(localStorage.getItem('ai4s_leads___KEY__')||'[]');
  leads.push({email:leadEmail.value,name:leadName.value,answers,time:new Date().toISOString()});
  localStorage.setItem('ai4s_leads___KEY__',JSON.stringify(leads));
  document.getElementById('leadOk').style.display='block';
  e.target.querySelector('button').disabled=true;});
// 渲染工具卡(技能+资产,点击展开详情与开源地址)
var sBox=document.getElementById('skillsBox'),aBox=document.getElementById('assetsBox');
function installCmd(s){if(s.source.indexOf('claude-scientific-skills')>=0)return '# 装进 Claude Code / Cursor<br>npx skills add K-Dense-AI/claude-scientific-skills '+s.id;if(s.source.indexOf('OpenAI4S')>=0)return '# OpenAI4S 技能, 克隆即用<br>git clone https://github.com/PKU-YuanGroup/OpenAI4S';if(s.source.indexOf('supervisor-skills')>=0)return '# Supervisor-Skills 技能(非商业)<br>git clone https://github.com/HKUSTDial/Supervisor-Skills';return '# open-science 技能<br>git clone https://github.com/ai4s-research/open-science';}
function srcLink(s){var m={'claude-scientific-skills':'https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/skills/'+s.id,'OpenAI4S':'https://github.com/PKU-YuanGroup/OpenAI4S/tree/main/skills/'+s.id,'supervisor-skills':'https://github.com/HKUSTDial/Supervisor-Skills/tree/main/skills/'+s.id,'open-science':'https://github.com/ai4s-research/open-science'};return m[s.source.split('+')[0]]||m['open-science'];}
function licShort(l){return l.replace('CC-BY-NC-SA-4.0','NC-SA').replace('CC-BY-4.0','BY');}
if(sBox)sBox.innerHTML=SKILLS_DATA.map(function(s){return '<div class="tool-card" id="'+s.id+'"><div class="tc-top"><span class="tc-name">'+s.id+'</span><span class="tc-badge">'+s.环节+'</span>'+(s.license&&s.license!=='MIT'?'<span class="tc-lic">'+licShort(s.license)+'</span>':'')+'</div><div class="tc-cn">'+(s.cn||s.description.slice(0,60))+'</div><div class="tc-detail"><div class="en">'+s.description+'</div><div class="install-box">'+installCmd(s)+'</div><a href="'+srcLink(s)+'" target="_blank">查看源技能文档 -></a>'+(TUT_IDS.indexOf(s.id)>=0?'<a class="tut-link" href="tutorials.html#'+s.id+'">📖 中文教程</a>':'')+'</div></div>';}).join('');
if(aBox)aBox.innerHTML=ASSETS_DATA.map(function(a){return '<div class="tool-card" id="asset-'+a.名称+'"><div class="tc-top"><span class="tc-name">'+a.名称+'</span><span class="tc-badge">'+a.类型+'</span></div><div class="tc-cn">'+(a.简介||'').slice(0,60)+'</div><div class="tc-detail"><div class="en">'+(a.简介||'')+'</div><div class="asset-meta">机构: '+(a.机构||'')+' · 类型: '+a.类型+'</div></div></div>';}).join('');
[sBox,aBox].forEach(function(box){if(box)box.addEventListener('click',function(e){var c=e.target.closest('.tool-card');if(c&&!e.target.closest('a'))c.classList.toggle('open');});});
// guide-box 点击展开 + 详情工具名自动链接(匹配技能/资产,锚点跳转)
document.querySelectorAll('.guide-exp').forEach(function(box){box.addEventListener('click',function(e){if(e.target.tagName==='A')return;box.classList.toggle('open');var h=box.querySelector('.exp-hint');if(h)h.textContent=box.classList.contains('open')?'▴ 收起':'▾ 详情';});});
function linkTools(text){var map={};var i=0;ASSETS_DATA.forEach(function(a){if(!a.名称)return;var ph='__L'+(i++)+'__';map[ph]='<a href="#asset-'+a.名称+'">'+a.名称+'</a>';text=text.split(a.名称).join(ph);});SKILLS_DATA.forEach(function(s){var ph='__L'+(i++)+'__';map[ph]='<a href="#'+s.id+'">'+s.id+'</a>';text=text.split(s.id).join(ph);});for(var k in map)text=text.split(k).join(map[k]);return text;}
document.querySelectorAll('.g-det').forEach(function(d){d.innerHTML=linkTools(d.innerHTML);});
// 工具名链接点击:直接展开对应工具卡详情 + 滚动定位(不跳转)
document.querySelectorAll('.g-det a').forEach(function(a){a.addEventListener('click',function(e){var href=a.getAttribute('href');if(href&&href.indexOf('#')===0){var t=document.getElementById(href.slice(1));if(t){e.preventDefault();t.classList.add('open');t.scrollIntoView({behavior:'smooth',block:'center'});}}});});
// 场景诊断工具名点击:模糊匹配下方工具卡并展开(事件委托,支持动态渲染)
function findToolCard(name){var card=document.getElementById(name)||document.getElementById('asset-'+name);if(card)return card;var cards=document.querySelectorAll('.tool-card');for(var i=0;i<cards.length;i++){var cn=cards[i].querySelector('.tc-name');if(cn&&(cn.textContent.indexOf(name)>=0||name.indexOf(cn.textContent)>=0))return cards[i];}return null;}
document.addEventListener('click',function(e){var link=e.target.closest('.tool-link');if(link){var name=link.getAttribute('data-tool');var card=findToolCard(name);if(card){card.classList.add('open');card.scrollIntoView({behavior:'smooth',block:'center'});}}});
`;

function gen(key){
  const v=VERTICALS[key];
  const disc=KEY2DISC[key];
  const kws=DISCKW[key];
  const skills=skillsFor(disc),assets=assetsFor(disc),courses=coursesFor(key),pols=policiesFor(disc);
  const discJson=JSON.stringify(kws);
  const polJson=JSON.stringify({政策:pols.map(p=>({标题:p.标题,状态:p.状态,申报时间窗:p.申报时间窗,资助强度:p.资助强度,重点领域:p.重点领域,匹配标签:p.匹配标签}))});

  // AI4S范畴板块
  const scopeHTML=v.AI4S范畴.map((x,i)=>`<div class="info-card"><h3>${x.标题}</h3><p>${x.内容}</p></div>`).join('');
  // 基础技巧
  const basicsHTML=v.基础技巧.map(x=>`<div class="info-card"><h3>${x.工具}</h3><p>${x.步骤}</p></div>`).join('');
  // 科研设计
  const designHTML=v.科研设计.map(x=>`<div class="step-card"><div class="step-no">${x.阶段}</div><p>${x.要点}</p></div>`).join('');
  // 政策
  const polHTML=pols.length?pols.map(p=>`<div class="pol-row"><div class="pol-name">${p.标题}<span class="pol-tag">${p.状态} · ${p.申报时间窗||''}</span></div><div class="pol-amt">${(p.资助强度||'').slice(0,40)}</div></div>`).join(''):'';
  // 适用工具数据(客户端渲染可展开卡片)
  const skillsData=JSON.stringify(skills.map(s=>({id:s.id,description:s.description,cn:s.cn,环节:s.环节,license:s.license,source:s.source})));
  const assetsData=JSON.stringify(assets.map(a=>({名称:a.名称,类型:a.类型,机构:a.机构,简介:a.简介})));
  const tutIds=JSON.stringify((typeof TUTORIALS!=='undefined'&&TUTORIALS.order)||[]);
  // 课程案例
  const caseHTML=courses.length?courses.map(c=>`<div class="case-card"><div class="case-no">课程 ${c.编号}</div><h3>${c.标题}</h3><p class="case-one">${c.一句话}</p><div class="case-meta">讲师: ${c.讲师} · 标签: ${c.标签}</div></div>`).join(''):'';
  // 场景卡选项(诊断Q1)
  const sceneOpts=v.场景.map(s=>`<div class="opt" data-v="${s.id}">${s.图标} ${s.名称}</div>`).join('');
  const stuckOpts=v.卡点.map(k=>`<div class="opt">${k}</div>`).join('');

  const html=`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${v.学科} × AI · 科研工具箱</title>
<style>
:root{--pri:${v.主题色};--pri2:${v.主题深};--deep:${v.主题深};--veil:${hex2rgba(v.主题深,0.42)};--acc:#1a56db;--ink:#111827;--sub:#6b7280;--line:#e5e7eb;--bg:${v.主题浅};--card:#fff;}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;color:var(--ink);background:#fafafa;line-height:1.7}
.wrap{max-width:1100px;margin:0 auto;padding:0 20px}
nav{position:sticky;top:0;background:rgba(255,255,255,.95);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);z-index:50}
nav .wrap{display:flex;align-items:center;justify-content:space-between;height:60px}
.logo{font-weight:800;font-size:19px;color:var(--deep)}.logo span{color:var(--pri)}
nav a.btn{background:var(--pri);color:#fff;padding:9px 18px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600}
.hero{position:relative;color:#fff;padding:70px 0 60px;overflow:hidden}
.hero-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}
.hero-veil{position:absolute;inset:0;z-index:1;background:linear-gradient(100deg,var(--veil) 0%,transparent 68%),linear-gradient(180deg,rgba(0,0,0,.08) 0%,rgba(0,0,0,0) 45%,rgba(0,0,0,.38) 100%)}
.hero .wrap{position:relative;z-index:2}
.hero .kick{display:inline-block;background:rgba(255,255,255,.15);padding:5px 14px;border-radius:20px;font-size:13px;margin-bottom:18px;font-weight:600}
.hero h1{font-size:38px;line-height:1.25;font-weight:800;margin-bottom:16px}
.hero p{font-size:17px;opacity:.94;max-width:680px;margin-bottom:28px}
.hero .cta{display:inline-block;background:#fff;color:var(--deep);padding:14px 32px;border-radius:10px;font-weight:700;font-size:17px;text-decoration:none;box-shadow:0 6px 20px rgba(0,0,0,.18)}
.badges{display:flex;gap:26px;margin-top:38px;flex-wrap:wrap}
.badges div{font-size:13px;opacity:.92}.badges b{display:block;font-size:25px;font-weight:800}
section{padding:54px 0}
.sec-title{font-size:27px;font-weight:800;text-align:center;margin-bottom:8px;color:var(--deep)}
.sec-sub{text-align:center;color:var(--sub);margin-bottom:34px;font-size:15px}
.sec-num{display:inline-block;background:var(--pri);color:#fff;width:32px;height:32px;border-radius:50%;line-height:32px;text-align:center;font-size:15px;font-weight:700;margin-right:10px;vertical-align:middle}
.grid2{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:18px}
.info-card{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--pri);border-radius:12px;padding:22px}
.info-card h3{color:var(--deep);font-size:18px;margin-bottom:8px}
.info-card p{font-size:14px;color:#374151;line-height:1.6}
.step-card{display:flex;gap:16px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:18px 22px;align-items:flex-start}
.step-no{background:var(--bg);color:var(--deep);font-weight:700;font-size:14px;padding:6px 14px;border-radius:8px;white-space:nowrap;border:1px solid var(--pri)}
.step-card p{font-size:14px;color:#374151;flex:1}
.scene-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:18px}
.scene{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:24px;transition:.2s;cursor:pointer}
.scene:hover{box-shadow:0 10px 28px rgba(0,0,0,.08);transform:translateY(-3px);border-color:var(--pri)}
.scene .ic{font-size:32px;margin-bottom:10px}
.scene h3{font-size:19px;margin-bottom:6px;color:var(--deep)}
.scene .one{font-size:13.5px;color:var(--sub);margin-bottom:12px;line-height:1.5}
.scene .who{font-size:12px;background:var(--bg);color:var(--deep);padding:5px 11px;border-radius:8px;display:inline-block;margin-bottom:12px}
.scene .tools-count{font-size:12.5px;color:var(--pri);font-weight:700}
.scene .hook{margin-top:12px;padding-top:12px;border-top:1px dashed var(--line);font-size:12.5px;color:#92400e;font-style:italic}
.scene-detail{display:none;background:#fff;border:1px solid var(--line);border-radius:14px;padding:28px;margin-top:18px}
.scene-detail.open{display:block}
.sd-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.sd-head h3{font-size:22px;color:var(--deep)}
.sd-close{background:none;border:1px solid var(--line);border-radius:8px;padding:6px 14px;cursor:pointer;color:var(--sub)}
.sd-pain{background:#fff7ed;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:8px;font-size:14px;margin:14px 0}
.tool-row{display:flex;gap:14px;padding:13px 0;border-bottom:1px dashed var(--line);align-items:flex-start}
.tool-row:last-child{border:none}
.tool-row .nm{font-weight:700;min-width:170px;font-size:14.5px}
.tool-row .nm .tag{display:block;font-size:11px;color:var(--pri);font-weight:600;margin-top:2px}
.tool-row .val{flex:1;font-size:13.5px;color:#374151}
.tool-row .heat{color:var(--pri);font-weight:700;font-size:12.5px;white-space:nowrap}
.tool-link{color:var(--pri);cursor:pointer;border-bottom:1px dashed var(--pri);display:inline-block}
.tool-link:hover{color:var(--deep);border-color:var(--deep)}
.sd-hook{margin-top:16px;background:linear-gradient(135deg,var(--deep),var(--pri));color:#fff;padding:14px 18px;border-radius:10px;font-size:14.5px;font-weight:600}
.diag{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:32px;max-width:780px;margin:0 auto}
.q{margin-bottom:22px}.q label{display:block;font-weight:700;margin-bottom:11px;font-size:15.5px}
.q .num{color:var(--pri);margin-right:6px}
.opts{display:flex;flex-wrap:wrap;gap:9px}
.opt{border:1.5px solid var(--line);background:#fff;padding:9px 16px;border-radius:9px;cursor:pointer;font-size:13.5px;transition:.15s}
.opt:hover{border-color:var(--pri)}.opt.sel{background:var(--pri);color:#fff;border-color:var(--pri)}
.diag-btn{width:100%;background:var(--deep);color:#fff;border:none;padding:14px;border-radius:10px;font-size:16px;font-weight:700;cursor:pointer;margin-top:6px}
.diag-btn:disabled{background:#9ca3af;cursor:not-allowed}
.report{display:none;margin-top:10px}
.rep-block{background:#fff;border:1px solid var(--line);border-radius:12px;padding:20px;margin-bottom:14px}
.rep-block h4{color:var(--deep);margin-bottom:11px;font-size:15.5px}
.rep-pain{background:#fff7ed;border-left:4px solid #f59e0b;padding:13px 17px;border-radius:8px;margin-bottom:14px;font-size:14px}
.warntip{background:#fef2f2;border-left:4px solid #e02424;padding:11px 15px;border-radius:8px;font-size:13.5px;margin-top:10px}
.lead{background:linear-gradient(135deg,var(--deep),var(--pri));border-radius:14px;padding:30px;color:#fff;text-align:center;margin-top:18px}
.lead h3{font-size:20px;margin-bottom:8px}.lead p{opacity:.92;margin-bottom:18px;font-size:13.5px}
.lead form{display:flex;gap:10px;max-width:520px;margin:0 auto;flex-wrap:wrap;justify-content:center}
.lead input{flex:1;min-width:160px;padding:12px 15px;border-radius:9px;border:none;font-size:14.5px}
.lead button{background:#fff;color:var(--deep);border:none;padding:12px 24px;border-radius:9px;font-weight:700;cursor:pointer}
.lead-ok{display:none;margin-top:12px;font-weight:600}
.pol-row{display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px dashed var(--line);gap:14px}
.pol-row:last-child{border:none}
.pol-name{font-weight:600;font-size:14.5px;flex:1}.pol-name .pol-tag{display:block;font-size:11px;color:var(--pri);font-weight:600;margin-top:2px}
.pol-amt{color:var(--pri);font-weight:700;font-size:13.5px;white-space:nowrap}
.tool-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
.tool-card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:16px;cursor:pointer;transition:.2s}
.tool-card:hover{border-color:var(--pri);box-shadow:0 4px 12px rgba(0,0,0,.06)}
.tool-card .tc-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;gap:8px}
.tool-card .tc-name{font-weight:700;color:var(--deep);font-size:14px}
.tool-card .tc-badge{font-size:11px;background:var(--bg);color:var(--deep);padding:2px 8px;border-radius:6px;white-space:nowrap}
.tool-card .tc-lic{font-size:10px;background:#fef3c7;color:#92400e;padding:1px 6px;border-radius:4px}
.tool-card .tc-cn{font-size:12.5px;color:var(--sub);line-height:1.5}
.tool-card .tc-detail{display:none;margin-top:12px;padding-top:12px;border-top:1px dashed var(--line)}
.tool-card.open .tc-detail{display:block}
.tool-card .en{font-size:12px;color:#374151;margin-bottom:8px;line-height:1.5}
.tool-card .install-box{background:#0f172a;color:#a7f3d0;padding:10px 12px;border-radius:6px;font-size:11.5px;font-family:monospace;margin:8px 0}
.tool-card .asset-meta{font-size:12px;color:var(--sub);margin-top:6px}
.tool-card a{display:inline-block;margin-top:6px;color:var(--pri);font-size:12.5px;text-decoration:none}
.tool-card .tut-link{margin-left:10px}
.tc-lic{font-size:10px;background:#fef3c7;color:#92400e;padding:1px 6px;border-radius:4px}
.case-card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:20px;border-top:3px solid var(--pri)}
.case-no{font-size:12px;color:var(--pri);font-weight:600;margin-bottom:6px}
.case-card h3{font-size:16px;color:var(--deep);margin-bottom:6px}
.case-one{font-size:13.5px;color:var(--sub);margin-bottom:8px}
.case-meta{font-size:12px;color:var(--sub)}
.empty{color:var(--sub);font-size:14px;text-align:center;padding:20px}
.guide-box{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:22px;margin-bottom:14px}
.guide-box h4{color:var(--deep);font-size:15px;margin-bottom:8px}
.guide-box p{font-size:13.5px;color:#374151}
.guide-exp{cursor:pointer;transition:.2s}.guide-exp:hover{border-color:var(--pri)}
.guide-exp .exp-hint{font-size:12px;color:var(--pri);font-weight:400;float:right}
.guide-exp .g-det{display:none;margin-top:10px;padding-top:10px;border-top:1px dashed var(--line);font-size:13.5px;color:#374151;line-height:1.7}
.guide-exp.open .g-det{display:block}
.guide-exp .g-det a{color:var(--pri);text-decoration:none;border-bottom:1px dashed var(--pri);cursor:pointer}
footer{background:var(--deep);color:rgba(255,255,255,.8);text-align:center;padding:28px 0;font-size:13px;margin-top:40px}
footer a{color:#fff}
@media(max-width:640px){.grid2,.scene-grid{grid-template-columns:1fr}.hero h1{font-size:28px}}
</style>
</head>
<body>
<nav><div class="wrap">
  <div class="logo">${v.学科}<span>×</span>AI 工具箱</div>
</div></nav>

<header class="hero">
  <video class="hero-video" autoplay muted loop playsinline><source src="assets/img/${v.视频||'rocket.mp4'}" type="video/mp4"></video>
  <div class="hero-veil"></div>
  <div class="wrap">
  <div class="kick">${v.图标} 专为${v.受众}打造</div>
  <h1>${v.Hero标题}</h1>
  <p>${v.Hero副}</p>
  <a class="cta" href="#diag">找到我的研究场景 →</a>
  <div class="badges">
    ${v.统计.map(s=>`<div><b>${s[0]}</b>${s[1]}</div>`).join('')}
  </div>
</div></header>

<!-- 1. AI4S 使用范畴 -->
<section id="scope"><div class="wrap">
  <h2 class="sec-title"><span class="sec-num">1</span>AI4S 使用范畴</h2>
  <p class="sec-sub">AI 在${v.学科}领域能做什么--四个核心方向</p>
  <div class="grid2">${scopeHTML}</div>
</div></section>

<!-- 2. 基础使用技巧 -->
<section id="basics" style="background:#fff"><div class="wrap">
  <h2 class="sec-title"><span class="sec-num">2</span>基础使用技巧</h2>
  <p class="sec-sub">从零上手--核心工具的使用路径</p>
  <div class="grid2">${basicsHTML}</div>
</div></section>

<!-- 3. 科研设计指南 -->
<section id="design"><div class="wrap">
  <h2 class="sec-title"><span class="sec-num">3</span>科研设计指南</h2>
  <p class="sec-sub">如何设计 AI 辅助的${v.学科}研究--分阶段要点</p>
  <div style="max-width:820px;margin:0 auto">${designHTML}</div>
</div></section>

<!-- 4. 场景诊断建议 -->
<section id="scenes" style="background:#fff"><div class="wrap">
  <h2 class="sec-title"><span class="sec-num">4</span>场景诊断建议</h2>
  <p class="sec-sub">点开你的方向,看同行在用什么 AI;3 个问题生成专属落地路径</p>
  <div class="scene-grid" id="sceneGrid"></div>
  <div class="scene-detail" id="sceneDetail"></div>
</div></section>

<section id="diag"><div class="wrap">
  <h2 class="sec-title"><span class="sec-num">4</span>🧭 ${v.学科} AI 场景诊断</h2>
  <p class="sec-sub">3 个问题,生成你的专属《${v.学科} AI 落地路径》</p>
  <div class="diag">
    <div class="q"><label><span class="num">Q1</span>你的研究方向最接近哪个场景?</label>
      <div class="opts" data-q="场景">${sceneOpts}</div></div>
    <div class="q"><label><span class="num">Q2</span>当前最大的卡点?</label>
      <div class="opts" data-q="卡点">${stuckOpts}</div></div>
    <div class="q"><label><span class="num">Q3</span>你的年龄(青年专项匹配)?</label>
      <div class="opts" data-q="年龄">
        <div class="opt" data-v="35">≤35岁</div><div class="opt" data-v="38">36-40岁</div><div class="opt" data-v="45">41岁以上</div>
      </div></div>
    <button class="diag-btn" id="genBtn" disabled>生成我的落地路径</button>
    <div class="report" id="report">
      <div class="rep-pain" id="repPain"></div>
      <div class="rep-block"><h4>🛠️ 你的场景推荐工具</h4><div id="repTools"></div></div>
      <div class="rep-block"><h4>💰 可申报政策</h4><div id="repPols"></div></div>
      <div id="repWarn"></div>
      <div class="lead">
        <h3>📄 获取完整版 + 百团百项自检清单</h3>
        <p>留下邮箱,发送《${v.学科} AI 落地完整报告》《百团百项申报自检清单》</p>
        <form id="leadForm">
          <input type="email" id="leadEmail" placeholder="你的邮箱" required>
          <input type="text" id="leadName" placeholder="姓名/单位(选填)">
          <button type="submit">发送完整报告</button>
        </form>
        <div class="lead-ok" id="leadOk">✓ 已收到!完整报告将发送至你的邮箱。</div>
      </div>
    </div>
  </div>
</div></section>

<!-- 5. 政策扶持指引 -->
<section id="policy" style="background:#fff"><div class="wrap">
  <h2 class="sec-title"><span class="sec-num">5</span>政策扶持指引</h2>
  <p class="sec-sub">${v.学科}方向可申报的经费政策(以官方通知为准)</p>
  <div style="max-width:820px;margin:0 auto">${polHTML}</div>
</div></section>

<!-- 6. 适用工具 -->
<section id="tools"><div class="wrap">
  <h2 class="sec-title"><span class="sec-num">6</span>适用工具</h2>
  <p class="sec-sub">该学科适用的科研技能包工具 + 平台资产 + 流程/数据集/模型/算力指导</p>
  <div class="guide-box guide-exp"><h4>🔧 科研流程规划 <span class="exp-hint">▾ 详情</span></h4><p class="g-sum">${v.适用工具指导.流程.摘}</p><div class="g-det">${v.适用工具指导.流程.详}</div></div>
  <div class="guide-box guide-exp"><h4>📊 数据集采纳 <span class="exp-hint">▾ 详情</span></h4><p class="g-sum">${v.适用工具指导.数据集.摘}</p><div class="g-det">${v.适用工具指导.数据集.详}</div></div>
  <div class="guide-box guide-exp"><h4>🤖 模型与算力选择 <span class="exp-hint">▾ 详情</span></h4><p class="g-sum">${v.适用工具指导.模型.摘} ｜ 算力:${v.适用工具指导.算力.摘}</p><div class="g-det">${v.适用工具指导.模型.详}<br>算力:${v.适用工具指导.算力.详}</div></div>
  <h4 style="color:var(--deep);margin:24px 0 10px;font-size:15px">开源技能(skills 包,${skills.length} 个,点击查看详情)</h4>
  <div id="skillsBox" class="tool-grid"></div>
  <h4 style="color:var(--deep);margin:24px 0 10px;font-size:15px">平台资产(${assets.length} 项,点击查看详情)</h4>
  <div id="assetsBox" class="tool-grid"></div>
</div></section>

<!-- 7. 使用案例(课程) -->
<section id="cases" style="background:#fff"><div class="wrap">
  <h2 class="sec-title"><span class="sec-num">7</span>使用案例</h2>
  
  <div class="grid2">${caseHTML}</div>
</div></section>

<footer>
  ${v.学科} × AI 工具箱 · <a href="index.html">返回门户</a>
</footer>

<script>var VERTICALS=${JSON.stringify({[key]:v})};var POLICIES_JSON=${polJson};var SKILLS_DATA=${skillsData};var ASSETS_DATA=${assetsData};var TUT_IDS=${tutIds};</script>
<script>
${CLIENT.replace(/__KEY__/g,key).replace(/__DISCKW_JSON__/g,discJson)}
</script>
</body>
</html>`;
  fs.writeFileSync(path.join(DIR,key+'.html'),html,'utf-8');
  console.log(`✓ ${key}.html (场景${v.场景.length}/技能${skills.length}/资产${assets.length}/课程${courses.length}/政策${pols.length})`);
}

['life','material','earth','math','engineering','cross'].forEach(gen);
console.log('\n✓ 6 学科页生成完成');
