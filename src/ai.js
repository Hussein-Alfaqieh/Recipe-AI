export async function getRecipeFromMistral(ingredientsArr, customRequirement, userServes) {

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"
    
    // We are now talking to OUR backend, not Hugging Face directly
    try {
        const response = await fetch(`${backendUrl}/generate-recipe`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ingredients: ingredientsArr,
                custom_requirement: customRequirement || null, // Send null if empty
                servings: userServes || null
            })
        })

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`)
        }

        const data = await response.json()
        return data.recipe

    } catch (err) {
        console.error("Error fetching recipe:", err)
        throw err 
    }
}