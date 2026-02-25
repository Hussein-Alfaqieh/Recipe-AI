import {createRoot} from "react-dom/client"
import App from "./App"


import { BrowserRouter } from "react-router-dom" 

const root = createRoot(document.getElementById("root"))
root.render(
    <BrowserRouter>  {/* Wrapped the entire application in the Router so it can listen to the URL. */}
        <App />
    </BrowserRouter>)