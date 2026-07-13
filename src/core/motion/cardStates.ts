export const cardStates={

waiting:(depth:number)=>({

scale:1-depth*.04,

x:depth*14,

y:depth*18,

opacity:1,

zIndex:20-depth

}),

active:{

scale:1,

x:0,

y:0,

opacity:1,

zIndex:50

},

lift:{

y:-26,

scale:1.03,

rotate:-2

},

exit:{

x:-1500,

rotate:-8,

opacity:0,

scale:1.08

}

};
