import Header from "./Header"
import Main from "./Main"
import Favorites from "./Favorites" // <--- ADD THIS
import { Routes, Route } from "react-router-dom"
import { useState, useEffect } from "react" 
import { supabase } from "./supabaseClient" 
import Auth from "./Auth"                   


export default function App() {

    const [session, setSession] = useState(null)  // If it is null, it means "No one is here."
                                                // If it has data (an object), it means "User is logged in."

  useEffect(() => {
    // 1. Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {     // supabase.auth.getSession(): "Hey Supabase, did this user leave their browser open? Are they still logged in from yesterday?"
                                                                     // .then(...): "Once you find the answer, run this code."
                                                                     // { data: { session } }: This is fancy syntax (Destructuring) to dig deep into the response box and grab only the session ticket.
      setSession(session)  // setSession(session): "Okay, save that ticket in our State memory." (If they were logged in, the app instantly knows).
    })

    // 2. Listen for login/logout events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {  // onAuthStateChange: This sets up a security camera. It watches for any changes while the user is using the app.
                                                                // (_event, session): We ignore the _event (like "SIGNED_IN" or "SIGNED_OUT") and just grab the new session.
      setSession(session)   // Immediately update our State. If they clicked logout, session becomes null. If they logged in, session becomes data.
    })

    return () => subscription.unsubscribe()
  }, [])

  // IF NOT LOGGED IN -> Show Login Screen
  if (!session) {
    return <Auth />
  }


    return (
        <>
            <Header session = {session}/> {/* Header stays outside Routes so it is always visible */}


            <Routes>
                <Route path="/" element={<Main session={session} />} />
                <Route path="/favorites" element={<Favorites session={session} />} />
            </Routes>
        </>
    )
}

