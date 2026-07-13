import { motion } from "framer-motion";

interface Props{
children:React.ReactNode;
}

export default function BrowserShell({children}:Props){

return(

<motion.div

initial={{
scale:.82,
opacity:0
}}

animate={{
scale:1,
opacity:1
}}

transition={{
duration:1.0
}}

style={{

width:1180,

height:680,

borderRadius:26,

overflow:"hidden",

background:"#0F172A",

border:"1px solid rgba(255,255,255,.08)",

boxShadow:"0 50px 160px rgba(0,0,0,.55)",

position:"relative"

}}

>

{children}

</motion.div>

);

}
