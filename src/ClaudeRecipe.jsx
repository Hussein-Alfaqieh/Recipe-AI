import ReactMarkdown from "react-markdown"
import React from "react"

export default function ClaudeRecipe(props) {
    const [isSaved,setIsSaved]=React.useState(false)

    function Save(){
        props.addToFavorites()
        setIsSaved(saved => !saved)
    }
    

    return (
        <section className="suggested-recipe-container" aria-live="polite">
            <h2>Chef Claude Recommends:</h2>
            <button onClick = {Save} disabled = {isSaved}>Add to Favorites</button>
            <ReactMarkdown>{props.recipe}</ReactMarkdown>
        </section>
    )
}