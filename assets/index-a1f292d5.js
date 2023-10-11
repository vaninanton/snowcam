import{r as v,H as p,o as l,c,d as u,a as i,t as d,b as h,e as f,F as m,f as g,g as _,h as w}from"./vendor-a62f170c.js";(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))o(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const a of t.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function n(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function o(e){if(e.ep)return;e.ep=!0;const t=n(e);fetch(e.href,t)}})();const x=(s,r)=>{const n=s.__vccOpts||s;for(const[o,e]of r)n[o]=e;return n},y={setup(){return{video:v(null)}},props:{src:String,poster:String},methods:{playVideo(){if(p.isSupported()){const s=new p;s.loadSource(this.src),s.attachMedia(this.video),s.on(p.Events.MANIFEST_PARSED,function(){this.video.play()})}else this.video.src=this.src,this.video.play()},fullscreen(){this.video.play(),this.video.requestFullscreen?this.video.requestFullscreen():this.video.webkitrequestFullscreen?this.video.webkitRequestFullscreen():this.video.webkitEnterFullScreen?this.video.webkitEnterFullScreen():this.video.mozRequestFullscreen&&this.video.mozRequestFullScreen()}},mounted(){this.playVideo()}};function b(s,r,n,o,e,t){return l(),c("video",{class:"absolute inset-0 w-full h-full [mask-image:radial-gradient(white,black)]",ref:"video",onClick:r[0]||(r[0]=(...a)=>t.fullscreen&&t.fullscreen(...a)),muted:"",playsinline:""},null,512)}const k=x(y,[["render",b]]),W={data(){return{weatherData:null,limit:5}},methods:{async getMeteoBlue(){this.weatherData=await fetch("https://api-v2.shymbulak-dev.com/content-service/weather/meteoblue").then(s=>s.json()).then(s=>s)}},computed:{formattedWeatherData(){if(this.weatherData===null)return[];let s=[],r=this.weatherData.data_1h,n=r.time;for(let e=0;e<n.length;e++){var o={time:u(r.time[e]),temperature:r.temperature[e],img:"pictocode/"+r.pictocode[e]+"_"+(r.isdaylight[e]?"day":"night")+".svg",windspeed:r.windspeed[e],relativehumidity:r.relativehumidity[e],precipitation_probability:r.precipitation_probability[e]};s.push(o)}return s},nowWeather(){return this.formattedWeatherData.length===0?null:this.formattedWeatherData.find(s=>s.time.isSame(u().startOf("hour")))},forecast(){return this.limit?this.formattedWeatherData.filter(s=>s.time.isAfter(u())).slice(0,this.limit):this.formattedWeatherData}},mounted(){this.getMeteoBlue()}},F={class:"flex flex-col items-center justify-center w-screen text-gray-700 px-10 pt-5 bg-gradient-to-br"},S={class:"w-full max-w-screen-sm bg-white p-6 rounded-xl ring-8 ring-white ring-opacity-40"},D={class:"flex justify-between"},j={class:"flex flex-col"},O={class:"text-6xl font-bold"},N={key:0},q={class:"flex cols-2 gap-4"},E={class:"text-xs font-light text-gray-400"},M={key:0},V={class:"text-xs font-light text-gray-400"},$={key:0},z=i("span",{class:"font-semibold mt-1 text-gray-500"},"Сейчас",-1),A=["src"],L={class:"flex justify-between mt-12"},P={class:"flex flex-col items-center"},B={class:"font-semibold text-lg"},C=["src"],H={class:"font-semibold mt-1 text-sm"},R={class:"text-xs font-light text-gray-400"},I={class:"text-xs font-light text-gray-400"};function T(s,r,n,o,e,t){return l(),c("div",F,[i("div",S,[i("div",D,[i("div",j,[i("span",O,[t.nowWeather?(l(),c("span",N,d(Math.floor(t.nowWeather.temperature))+"°C",1)):h("",!0)]),i("div",q,[i("div",E,[f(" Ветер: "),t.nowWeather?(l(),c("span",M,d(t.nowWeather.windspeed)+" m/s",1)):h("",!0)]),i("div",V,[f(" Осадки: "),t.nowWeather?(l(),c("span",$,d(t.nowWeather.precipitation_probability)+" %",1)):h("",!0)])]),z]),t.nowWeather?(l(),c("img",{key:0,src:t.nowWeather.img,alt:"",class:"h-24"},null,8,A)):h("",!0)]),i("div",L,[(l(!0),c(m,null,g(t.forecast,a=>(l(),c("div",P,[i("span",B,d(a.time.format("HH:mm")),1),i("img",{src:a.img,alt:"",class:"h-10 fill-current text-gray-400 mt-3"},null,8,C),i("div",H,d(Math.floor(a.temperature))+"°C ",1),i("div",R," Ветер: "+d(a.windspeed)+" m/s ",1),i("div",I," Осадки: "+d(a.precipitation_probability)+" % ",1)]))),256))])])])}const K=x(W,[["render",T]]),G="/snowcam/previews/3212b47c65ccc0cb9759f5c08632c563.jpg",J="/snowcam/previews/ffa10e45b1d87ab0aa8796bc7969046b.jpg",Q="/snowcam/previews/d5361ff25a96271df9ac614d9138806a.jpg",U="/snowcam/previews/197f1dde9a2c929cca5496f225cc2d62.jpg",X={class:"grid max-w-[26rem] sm:max-w-[52.5rem] mt-16 sm:mt-20 md:mt-32 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 mx-auto gap-6 lg:gap-y-8 xl:gap-x-8 lg:max-w-7xl px-4 sm:px-6 lg:px-8"},Y={class:"group relative rounded-3xl bg-slate-50 p-6 dark:bg-slate-800/80 dark:highlight-white/5 hover:bg-slate-100 dark:hover:bg-slate-700/50"},Z={class:"aspect-video relative rounded-md transform overflow-hidden shadow-[0_2px_8px_rgba(15,23,42,0.08)] bg-slate-200 dark:bg-slate-700"},ee=["src"],te={class:"flex flex-wrap items-center mt-6"},se={class:"text-sm leading-6 text-slate-900 dark:text-white font-semibold group-hover:text-sky-500 dark:group-hover:text-sky-400"},re={class:"w-full flex-none text-[0.8125rem] leading-6 text-slate-500 dark:text-slate-400"},ie={data(){return{videos:[{title:"Ледник Богдановича",description:"Верхняя станция, камера в сторону сноупарка",src:"https://ipcam.kz/cam6/index.m3u8",poster:G},{title:"Средняя станция",description:"Средняя станция, где пили кофе и ели хотдоги",src:"https://ipcam.kz/cam5/index.m3u8",poster:J},{title:"Базовая станция, бугель",description:"Бугель на базовой станции",src:"https://ipcam.kz/cam2/index.m3u8",poster:Q},{title:"Базовая станция",description:"Базовая станция",src:"https://ipcam.kz/cam1/index.m3u8",poster:U}]}}},oe=Object.assign(ie,{__name:"App",setup(s){return(r,n)=>(l(),c(m,null,[_(K),i("ul",X,[(l(!0),c(m,null,g(r.videos,o=>(l(),c("li",Y,[i("div",Z,[i("img",{alt:"",fetchpriority:"high",width:"672",height:"494",decoding:"async",class:"absolute inset-0 w-full h-full",style:{color:"transparent"},src:o.poster},null,8,ee),_(k,{src:o.src,poster:o.poster},null,8,["src","poster"])]),i("div",te,[i("h2",se,d(o.title),1),i("p",re,d(o.description),1)])]))),256))])],64))}});w(oe).mount("#app");
