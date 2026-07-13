import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import StackCard from "./components/StackCard";

const cards = [
  {
    title:"Artificial Intelligence",
    body:"Engineering intelligent AI workflows."
  },
  {
    title:"Creative Motion",
    body:"Building premium cinematic motion graphics."
  },
  {
    title:"Cinematic Experiences",
    body:"Creating high-retention explainer videos."
  }
];

export default function StackFocusEngine(){

const[current,setCurrent]=useState(0);

useEffect(()=>{

if(current>=cards.length)return;

const timer=setTimeout(()=>{

setCurrent(v=>v+1);

},4600);

return()=>clearTimeout(timer);

},[current]);

return(

<div

style={{

position:"relative",

width:900,

height:520,

display:"flex",

justifyContent:"center",

alignItems:"center",

overflow:"visible"

}}

>

<AnimatePresence mode="popLayout">

{

cards
.slice(current)
.map((card,index)=>(

<StackCard

key={card.title}

title={card.title}

body={card.body}

depth={index}

active={index===0}

/>

))

}

</AnimatePresence>

</div>

);

}
