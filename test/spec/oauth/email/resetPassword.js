describe('In OAUTH module', function() {


    describe('common reset password tests', function() {
        var popEmail = corbelTest.common.mail.mailInterface.popEmail;
        var getCodeFromMail = corbelTest.common.mail.mailInterface.getCodeFromMail;

        var corbelDriver;
        var oauthCommonUtils;
        var userTestParams;

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
            oauthCommonUtils = corbelTest.common.oauth;
            userTestParams = oauthCommonUtils.getOauthUserTestParams();
        });


        it('reset password of an nonexistent user never fails', function(done) {
            var clientParams = {
                clientId: userTestParams.clientId,
                clientSecret: userTestParams.clientSecret
            };
            var email = 'randomEmail_' + Date.now() + '@nothing.net';

            corbelDriver.oauth
                .user(clientParams)
                .sendResetPasswordEmail(email)
                .should.notify(done);
        });


        it('email allows reset user account password with client sending once time token to change it [mail]',
            function(done) {

                var oneTimeToken;
                var clientParams = oauthCommonUtils.getClientParams();
                var oauthUserTest = {
                    username: 'randomUser' + Date.now(),
                    password: 'randomPassword' + Date.now()
                };

                corbelTest.common.mail
                    .mailInterface.getRandomMail()
                    .then(function(response) {
                        oauthUserTest.email = response;

                        return corbelDriver.oauth
                            .user(clientParams)
                            .create(oauthUserTest);
                    })
                    .then(function() {
                        return popEmail(oauthUserTest.email);
                    })
                    .then(function(mail) {
                       expect(mail).to.have.property('subject', 'Validate your account email');
                    })
                    .then(function() {
                        return corbelDriver.oauth
                            .user(clientParams)
                            .sendResetPasswordEmail(oauthUserTest.email);
                    })
                    .then(function() {
                        return popEmail(oauthUserTest.email);
                    })
                    .then(function(email) {
                        expect(email).to.have.property('subject', 'Reset your account password');
                        oneTimeToken = getCodeFromMail(email);

                        return corbelDriver.oauth
                            .user(oauthCommonUtils.getClientParams(), oneTimeToken)
                            .update('me', {
                                password: oauthUserTest.password + oauthUserTest.password
                            });
                    })
                    .then(function() {
                        return corbelDriver.oauth
                            .user(oauthCommonUtils.getClientParams(), oneTimeToken)
                            .update('me', {
                                password: oauthUserTest.password + oauthUserTest.password +
                                    oauthUserTest.password
                            })
                            .should.be.rejected;
                    })
                    .then(function() {
                        return oauthCommonUtils
                            .getToken(corbelDriver, oauthUserTest.username, oauthUserTest.password +
                                oauthUserTest.password);
                    })
                    .should.notify(done);
            });
    });
});
