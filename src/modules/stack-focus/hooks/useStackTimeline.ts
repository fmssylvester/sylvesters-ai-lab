import {useEffect,useState} from "react";

export default function useStackTimeline(count:number){

const[current,setCurrent]=useState(0);

useEffect(()=>{

if(current>=count-1)return;

const t=setTimeout(()=>{

setCurrent(c=>c+1);

},4800);

return()=>clearTimeout(t);

},[current,count]);

return{

current

};

}
