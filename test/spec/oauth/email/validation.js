describe('In OAUTH module', function() {

    describe('notifications tests', function() {
        var popEmail = corbelTest.common.mail.mailInterface.popEmail;
        var getCodeFromMail = corbelTest.common.mail.mailInterface.getCodeFromMail;


        var corbelDriver;
        var oauthCommonUtils;
        var clientParams;
        var userTestParams;
        var oauthUserTest;
        var userEmailData;

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
            oauthCommonUtils = corbelTest.common.oauth;
            userTestParams = oauthCommonUtils.getOauthUserTestParams();
            clientParams = oauthCommonUtils.getClientParams();
        });

        beforeEach(function(done) {
            oauthUserTest = {
                username: 'randomUser' + Date.now(),
                password: 'randomPassword' + Date.now()
            };

            return corbelTest.common.mail
                .mailInterface.getRandomMail()
                .then(function(response) {
                    userEmailData = response;
                    oauthUserTest.email = userEmailData;

                    return corbelDriver.oauth
                        .user(clientParams)
                        .create(oauthUserTest);
                })
                .should.notify(done);
        });

        it('email allows validate user account and has two endpoint that validate user account with email code [mail]',
            function(done) {
                var username = oauthUserTest.username;
                var password = oauthUserTest.password;
                var emailAddress = oauthUserTest.email;

                popEmail(emailAddress)
                    .then(function(email) {
                        expect(email).to.have.property('subject', 'Validate your account email');
                        var code = getCodeFromMail(email);

                        return corbelDriver.oauth
                            .user(clientParams, code)
                            .emailConfirmation('me');
                    })
                    .then(function() {
                        return oauthCommonUtils
                            .getToken(corbelDriver, username, password, true);
                    })
                    .then(function(response) {
                        expect(response.data['access_token']).to.match(oauthCommonUtils.getTokenValidation());
                    })
                    .should.notify(done);
            });

        it('email allows validate user account and has two endpoint that resend validation email [mail]',
            function(done) {
                var username = oauthUserTest.username;
                var password = oauthUserTest.password;
                var emailAddress = oauthUserTest.email;

                popEmail(emailAddress)
                    .then(function(email) {
                        expect(email).to.have.property('subject', 'Validate your account email');
                        var code = getCodeFromMail(email);

                        return corbelDriver.oauth
                            .user(clientParams, code)
                            .sendValidateEmail('me');
                    })
                    .then(function() {
                        return popEmail(emailAddress);
                    })
                    .then(function(email) {
                        expect(email).to.have.property('subject', 'Validate your account email');
                        var code = getCodeFromMail(email);

                        return corbelDriver.oauth
                            .user(clientParams, code)
                            .emailConfirmation('me');
                    })
                    .then(function() {
                        return oauthCommonUtils
                            .getToken(corbelDriver, username, password, true);
                    })
                    .then(function(response) {
                        expect(response.data['access_token']).to.match(oauthCommonUtils.getTokenValidation());
                    })
                    .should.notify(done);
            });
    });
});
