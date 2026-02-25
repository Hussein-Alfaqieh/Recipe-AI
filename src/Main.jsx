import React from "react"
import IngredientsList from "./IngredientsList"
import ClaudeRecipe from "./ClaudeRecipe"
import { getRecipeFromMistral } from "./ai"

import { supabase } from "./supabaseClient" 

export default function Main({ session }) {

    const [ingredients, setIngredients] = React.useState([])

    const [custom,setCustom] = React.useState("")

    const [userServes,setUserServes] = React.useState("")

    const [recipe, setRecipe] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState("")


    const [favorites,setFavorites] = React.useState([])
     

    async function getRecipe() {
        setIsLoading(true)
        setError("")
        try {
            const recipeMarkdown = await getRecipeFromMistral(ingredients, custom, userServes)
            setRecipe(recipeMarkdown)
        } catch (err) {
            setError(err.message || "Failed to generate recipe. Please check your API token and try again.")
            console.error("Error in getRecipe:", err)
        } finally {
            setIsLoading(false)
        }
    }


    async function addToFavorites(){
        const {error} = await supabase      // we only destructure { error }.
                                            //If error is null, we know it worked.
                                            //If error has a value, we know it failed.
        .from("saved_recipes")
        .insert({
            user_id: session.user.id,
            recipe_text: recipe
        }
        // You don't need .select() here because you are putting items into the box, not taking them out.
    )
        if (error) {
            console.error("Error saving:", error)
            alert("Failed to save recipe.")
        }
    }

    function handleSubmit(e) {
        e.preventDefault()
        const formData = new FormData(e.target)
        const newIngredient = formData.get("ingredient")
        if (newIngredient && newIngredient.trim()) {
            setIngredients(prevIngredients => [...prevIngredients, newIngredient.trim()])
            e.target.reset()
        }
    }


    function handleCustomChange(e) {
        e.preventDefault()
        const formData = new FormData(e.target)
        const userCustom = formData.get("custom-requiement")
        setCustom(userCustom)
        e.target.reset()
    }

    function handleServing(event) {
        event.preventDefault()
        const formData = new FormData(event.target)
        const userServings = formData.get("servings")
        setUserServes(userServings)
        event.target.reset()
    }
    
    function removeIngredient(ingredientToRemove){
        setIngredients(ingredients => 
            ingredients.filter(item => item != ingredientToRemove))
    }


    
    return (
        <main>
            <div className="user-input">
                <form onSubmit={handleSubmit} className="add-ingredient-form">
                    <label>Input Ingredients:</label>
                    
                    <div className="input-row">

                    <input
                        type="text"
                        placeholder="e.g. oregano"
                        aria-label="Add ingredient"
                        name="ingredient"
                    />

                    <button>Add ingredient</button>
                </div>
                </form>


                <form onSubmit={handleCustomChange} className="add-ingredient-form">
                <label>Add Custom Requirments</label>

                <div className="input-row">
                
                <input
                    type="text"
                    placeholder="Optional: e.g. dietry requirments" 
                    aria-label="Custom requirments"
                    name="custom-requiement"/>

                </div>

                </form>


                <form onSubmit={handleServing} className="add-ingredient-form">
                <label>Servings:</label>

                <div className="input-row">
                
                <input
                    type="text"
                    placeholder="Optional: e.g. 1" 
                    aria-label="Servings"
                    name="servings"/>

                </div>

                </form>


            </div>


            {userServes && <h2>Servings: {userServes}</h2>}


            {custom && <h2>Custom: {custom}</h2>}


            {ingredients.length>0 && 
            <IngredientsList 
            ingredients={ingredients} 
            getRecipe={getRecipe}
            isLoading={isLoading}
            removeIngredient={removeIngredient}
            />}


            {error && <div className="error-message" style={{color: 'red', padding: '1rem', margin: '1rem 0'}}>{error}</div>}
            
            {recipe && <ClaudeRecipe 
                        recipe={recipe} 
                        addToFavorites={addToFavorites}/>}
           
        </main>
    )
}