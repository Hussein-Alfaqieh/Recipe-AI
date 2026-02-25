import { Link } from "react-router-dom"
import React from "react"
import { supabase } from "./supabaseClient"
import ReactMarkdown from "react-markdown"

export default function Favorites({session}) {
    const [savedRecipes, setSavedRecipes] = React.useState([])

    // ... (Your fetchFavorites function and useEffect stay exactly the same) ...
    // ... (We removed the 'toggleRecipe' function and 'expandedId' state completely) ...

    async function fetchFavorites() {
        const { data, error } = await supabase
            .from("saved_recipes")
            .select("*")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false })

        if (error) {
            console.error('Error fetching:', error)
        } else {
            setSavedRecipes(data || [])
        }
    }

    React.useEffect(() => {
        fetchFavorites()
    }, [])


    async function removeFavorite(id) {
        // 1. Delete from Cloud
        const { error } = await supabase
            .from('saved_recipes')
            .delete() //This tells Supabase: "I am about to ask you to remove something."
            .eq('id', id) //"Only shred the file where the ID matches this number."

        if (error) {
            console.error('Error deleting:', error)
            alert("Could not remove from favorite!")
        } else {
            // 2. Remove from Screen
            setSavedRecipes(savedRecipes => savedRecipes.filter(item => item.id !== id))
        }
    }

    return (
        <div className="favorites-container">
            <Link to="/" className="back-link">← Back to Generator</Link>

            <h2>My Saved Recipes</h2>

            <div className="favorites-grid">
                {savedRecipes.length > 0 ? (
                    savedRecipes.map((recipe) => (
                        /* <details> creates a box that can open/close.
                           name="recipe-accordion" ensures only one opens at a time.
                        */
                        <details key={recipe.id} className="recipe-card" name="recipe-accordion"> {/*name="recipe-accordion": By giving them all the same name, the browser knows to close the others when you open a new one (acting like an accordion). */}
                            
                            {/* <summary> is the button you see when it's closed */}
                            <summary>{recipe.recipe_text.split("#")[1].trim()}
                                <button onClick = {()=>removeFavorite(recipe.id)}>
                                    Delete
                                </button>
                                    </summary> {/*// Splits the text by '#', grabs the second piece (the recipe name), and removes extra spaces from both ends.  */}
                                                                                        {/*The split() method doesn't pick just one #; it automatically finds every occurrence of that character in the string and uses them as "cut points".
                                                                                        First Split: It sees the very first # at the start. Since there is nothing before it, it creates an empty string for the first item in the list.
                                                                                        Second Split: It moves along until it sees the next #. Everything between the first # and this second # becomes your second item.
                                                                                        Resulting Array:
                                                                                        ["", " Chicken Lettuce Wraps ", "", " Servings: 4"]
                                                                                        Index 0: The empty space before the first #.
                                                                                        Index 1: The text you actually want.   */}
                            {/* Everything else is hidden until you click */}
                            <div className="recipe-content">
                                <ReactMarkdown>
                                    {recipe.recipe_text || "No text available"}
                                </ReactMarkdown>
                            </div>

                        </details>
                    ))
                ) : (
                    <p className="no-recipes-text">No saved recipes yet!</p>
                )}
            </div>
        </div>
    )
}