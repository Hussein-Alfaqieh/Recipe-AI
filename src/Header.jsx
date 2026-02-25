import { supabase } from './supabaseClient'
import { Link } from "react-router-dom" // This brings in a special component called Link from the routing library you installed.

export default function Header({ session }) {
    
    // 1. Here is the logout function
    async function handleLogout() {
        const { error } = await supabase.auth.signOut()
        if (error) console.log("Error logging out:", error.message)
    }
    return(
        <header>
            <Link to="/" className="logo-link"> {/* to="/": This tells React: "When someone clicks this, change the URL to just /."*/}
                <div className="header-left">
                    <img src="/src/chef-claude-icon.png" alt='logo' />
                    <h1>Recipe AI</h1>
                </div>
            </Link>
            
            <Link to="/favorites"> {/*to="/favorites": This tells React: "When clicked, change the URL to /favorites." */}
                <button className="my-recipes-btn">My Recipes</button>
            </Link>

            {/* 2. Call the function here */}
            <button onClick={handleLogout} className="sign-out-btn">
                    Sign Out
                </button>
        </header>
    )
}


/*
It knows where the "start" is because you explicitly told it in your App.jsx file.

There is no magic that automatically knows Main is the homepage. It relies entirely on this specific line of code you wrote:

JavaScript
<Route path="/" element={<Main session={session} />} />
*/