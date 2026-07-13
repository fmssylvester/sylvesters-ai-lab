export function activeGlow(active:boolean){

if(!active){

return{

outline:"none",

filter:"brightness(.92)"

}

}

return{

filter:

"brightness(1.12)",

boxShadow:

"0 0 60px rgba(96,165,250,.25),0 35px 120px rgba(0,0,0,.42)"

}

}
