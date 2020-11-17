export const getLetter = (transcript: string) =>  {
    switch (transcript.trim()) {
        case "a":
        case "hey":
        case "Hey":
        case "hey you":
        case "our":
        case "A.":
        case "eight":
            return 'A';
        case "b":
        case "bee":
        case "be":
        case "e":
        case "B.":
        case "Pee":
        case "P":
        case "p":
        case "P.":
            return 'B'
        case "c":
        case "see":
        case "sea":
        case "ce":
        case "C.":
            return 'C'
        case "d":
        case "deer":
        case "dear":
        case "de":
        case "D.":
        case "T.":
        case "the":
        case "The":
            return 'D'
        case "Question.":
        case "Questions.":
        case "question":
        case "questions":
        case "Christian.":
        case "christian":
        {
            return "Question"
        }
        default:
            return ('N/A');
    }
}