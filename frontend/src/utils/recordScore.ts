
import Airtable from 'airtable';

export const recordScore = (name: string, answeredQuestions: number, correctAnswers: number) => {
    var base = new Airtable({ apiKey: 'keygqbwOqEMf7Ku6g' }).base('appi0GjsuWmpXbPru');

    // @ts-ignore
    base('HighScores').create({
        "Name": name,
        "Answered questions": answeredQuestions,
        "Correct answers": correctAnswers
    }, function (err:any, record:any) {
        if (err) {
            console.error(err);
            return;
        }
         console.log(record);
    });

}
