const morphyDefense = {
    id: "morphy-defense",
    title: "Morphy Defense",
    movesAfterBase: [
        "a6",
        "Ba4",
        "Nf6",
        "O-O",
        "Be7",
        "Re1"
    ]
};

export const ruyBook = {
    id: "ruy-lopez",
    title: "Ruy Lopez",
    // list the most basic moves or it to be considered the Ruy Lopez
    baseMoves: ["e4", "e5", "Nf3", "Nc6", "Bb5"],
    variants: [morphyDefense]
};

