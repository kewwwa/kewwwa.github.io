!function(t,o){const i="323925712C8B49E48C00EBA72486203D";function r(e){e.preventDefault&&e.preventDefault();var t=o.querySelectorAll("details");let n=-1,r,l=!1;for(;!l&&++n<t.length;)r=t[n],l=!r.attributes.open;if(l)for(;n<t.length;)r=t[n],r.attributes.open||r.setAttribute("open",""),n++;else for(n=0;n<t.length;)r=t[n],r.removeAttribute("open"),n++}function l(e){e.preventDefault&&e.preventDefault(),t.print()}function s(e){e.preventDefault&&e.preventDefault(),elements.hideRequests.parentElement.parentElement.remove()}function n(e){e.currentTarget.attributes.open?e.currentTarget.removeAttribute("open"):e.currentTarget.setAttribute("open","")}function a(){4==this.readyState&&200==this.status&&function(e){let t,n,r,l,s;for(t=0;t<e.length;t++)if((n=e[t]).id?r=[o.getElementById(n.id)]:n.class&&(r=o.getElementsByClassName(n.class)),0<r.length)for(s=0;s<r.length;s++)l=r[s],l&&(l.innerText=c(n.text,i),n.link&&(l.href=c(n.link,i)))}(JSON.parse(this.responseText))}function c(e,t){const n=atob(e);let r,l,s="";for(r=0;r<n.length;r++)l=n.charCodeAt(r)-t.charCodeAt(r%t.length),s+=String.fromCharCode(l);return s}elementsId=["details","print","today","hideRequests"],elements={},function(){try{!function(){let e,t;for(e=0;e<elementsId.length;e++)t=elementsId[e],elements[t]=o.getElementById(t);if(elements.details.addEventListener("click",r,!1),elements.print.addEventListener("click",l,!1),elements.hideRequests.addEventListener("click",s,!1),elements.today){const n=new Date;elements.today.textContent=`(au ${("0"+n.getDate()).slice(-2)}/${("0"+(n.getMonth()+1)).slice(-2)}/${n.getFullYear()})`}}(),function(){var e=o.createElement("details");if(!1!==e.open&&!0!==e.open){const t=o.querySelectorAll("details");let e;for(e=0;e<t.length;e++)t[e].addEventListener("click",n,!1)}}(),function(){const e=new XMLHttpRequest;e.onreadystatechange=a,e.open("GET","/data.json",!0),e.send()}()}catch(e){console.error(e)}}()}(window,document);