import { ReactNode } from "react";
import { motion } from "framer-motion";

import AmbientParticles from "../components/atmosphere/AmbientParticles";
import VolumetricLight from "../components/lighting/VolumetricLight";

interface Props{
children:ReactNode;
}

export default function CinematicStage({children}:Props){

return(

<div

style={{

width:"100vw",
height:"100vh",

overflow:"hidden",

display:"flex",

justifyContent:"center",

alignItems:"center",

position:"relative",

background:
"radial-gradient(circle at center,#10182F 0%,#050914 72%,#02040B 100%)",

}}

>

<motion.div

animate={{

scale:[1,1.015,1],

}}

transition={{

duration:24,

repeat:Infinity,

ease:"easeInOut",

}}

style={{

position:"absolute",

inset:0,

}}

>

<VolumetricLight/>

</motion.div>

<motion.div

animate={{

x:[0,8,-8,0],

y:[0,-4,3,0],

}}

transition={{

duration:30,

repeat:Infinity,

ease:"easeInOut",

}}

style={{

position:"absolute",

inset:0,

}}

>

<AmbientParticles/>

</motion.div>

<motion.div

animate={{

x:[0,-3,3,0],

y:[0,2,-2,0],

scale:[1,1.005,1],

}}

transition={{

duration:18,

repeat:Infinity,

ease:"easeInOut",

}}

style={{

position:"relative",

zIndex:20,

}}

>

{children}

</motion.div>

</div>

);

}
