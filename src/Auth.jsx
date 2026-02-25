import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // The Login Function
  const handleLogin = async (e) => {      //const handleLogin: Naming our function.
    e.preventDefault()
    setLoading(true)    // "Turn on the loading spinner." (Useful if you had a spinner icon, or to disable buttons so users don't click twice).
    const { error } = await supabase.auth.signInWithPassword({ email, password }) // await: "Pause right here! Don't run the next line until Supabase replies." 
                                                                                  // supabase.auth.signInWithPassword(...): A built-in Supabase command. It takes the email and password variables from your State and sends them to the cloud.
    if (error) alert(error.message)
    setLoading(false)
  }

  // SIGN UP // (This is almost identical to Login, with one small change)
  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password }) //signUp: Instead of checking if a user exists, this creates a new user in the database.
    if (error) {
      alert(error.message)
    } else {
      alert('Check your email for the login link!')
    }
    setLoading(false)
  }

  return (
    <div className="auth-container">
        <div className="card form-card">
            <h2>Welcome!</h2>
            <p>Sign in to save your expenses.</p>
            <form>
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(event) => setEmail(event.target.value)} 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(event) => setPassword(event.target.value)} 
                />
                <div className="auth-buttons">
                    <button onClick={handleLogin} disabled={loading} className="submit-btn"> {/*disabled={loading}: If loading is true, gray out this button so they can't click it again. */}
                        {loading ? 'Loading...' : 'Log In'}
                    </button>
                    <button onClick={handleSignUp} disabled={loading} className="submit-btn secondary-btn">
                        Sign Up
                    </button>
                </div>
            </form>
        </div>
    </div>
  )
}