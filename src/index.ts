import {settings} from "./settings";
import {RequestWithQuery} from "./routes/types/RequestTypes";
import {RegistrationConfirmationCodeModel} from "./routes/types/RegistrationConfirmationCodeModel";
import {app, startApp} from "./server";

app.get('/confirm-registration', async (req: RequestWithQuery<RegistrationConfirmationCodeModel>, res) => {
    const url = settings.APP_HOST + 'auth/registration-confirmation'
    const result = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({code: req.query.code})
    })

    res.sendStatus(result.status)
})

startApp();
