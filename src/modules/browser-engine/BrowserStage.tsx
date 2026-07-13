import BrowserShell from "./BrowserShell";
import BrowserChrome from "./BrowserChrome";

export default function BrowserStage(){

return(

<BrowserShell>

<BrowserChrome/>

<div

style={{

flex:1,

height:"calc(100% - 58px)",

display:"flex",

justifyContent:"center",

alignItems:"center",

fontSize:42,

fontWeight:700,

color:"#fff"

}}

>

Browser Content

</div>

</BrowserShell>

);

}
