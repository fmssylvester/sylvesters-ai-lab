import { motion } from "framer-motion";

interface Props{
title:string;
body:string;
depth:number;
active:boolean;
}

export default function StackCard({
title,
body,
depth,
active
}:Props){

return(

<motion.div

initial={{
y:-850,
x:depth*16,
scale:0.88,
opacity:0
}}

animate={{

y:depth*22,

x:depth*16,

scale:1-depth*0.045,

opacity:1,

filter:active
?"brightness(1)"
:"brightness(.72)"

}}

exit={{

x:-1600,

y:-40,

rotate:-7,

scale:1.08,

opacity:0

}}

transition={

active
?{

duration:1.15,
      delay: depth*0.08,

ease:[0.18,0.92,0.24,1]

}
:{

duration:.95,
      delay: depth*0.08

}

}

style={

{

position:"absolute",

width:720,

height:320,

padding:52,

borderRadius:34,

overflow:"hidden",

background:
"linear-gradient(180deg,rgba(255,255,255,.10),rgba(255,255,255,.03))",

backdropFilter:"blur(32px)",

border:"1px solid rgba(255,255,255,.12)",

boxShadow:

active

?"0 45px 140px rgba(0,0,0,.48)"

:"0 24px 65px rgba(0,0,0,.24)",

display:"flex",

flexDirection:"column",

justifyContent:"center",

zIndex:100-depth

}

}

>

<motion.div

animate={

active

?{

opacity:1,

y:0

}

:{

opacity:0,

y:20

}

}

transition={{

duration:.55

}}

>

<h1

style={{

margin:0,

fontSize:48,

fontWeight:800,

letterSpacing:"-2px",

color:"#fff"

}}

>

{title}

</h1>

<p

style={{

marginTop:24,

fontSize:24,

lineHeight:1.6,

color:"#CBD5E1"

}}

>

{body}

</p>

</motion.div>

</motion.div>

);

}
