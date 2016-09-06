describe('In IAM module', function() {

    describe('while testing create user with oauth identity', function(){

        var corbelDriver;
        var userId;
        var random = Date.now();
        var oauthIdentifier;
        var emailDomain = '@funkifake.com';
        var authorize;
        var corbelIamDriver;

        var userOauth = {
            'username': 'createUserOauthTest' + random,
            'password': 'passwordTest',
            'email': 'createUserOauthTest' + random + emailDomain
        };

        var userIam = {
            'firstName': 'createUserIam' + random,
            'email': 'createUserIam.iam.' + random + emailDomain,
            'username': 'createUserIam.iam.' + random + emailDomain
        };

        var devCredentials = corbelTest.CONFIG.DEV_CREDENTIALS;
        var devIamUser = devCredentials.DEFAULT_USER_IAM;
        var devOauthClient = devCredentials.DEFAULT_CLIENT_OAUTH;
        var oauthCommon = corbelTest.common.oauth;

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
            corbelIamDriver = corbelTest.drivers['ADMIN_USER'].clone();
            var authorizationParams = oauthCommon.getClientParamsCodeIAM(corbelDriver, devIamUser, devOauthClient);
            authorize = corbelDriver.oauth.authorization(authorizationParams);
            
            corbelDriver.oauth
                .user(oauthCommon.getClientParams())
                .create(userOauth)
                .then(function (id) {
                    oauthIdentifier = id;
                })
                .should.notify(done);
        });

        afterEach(function(done){
            authorize
                .signout()
                .then(function(){
                     return oauthCommon.getToken(corbelDriver, userOauth.username, userOauth.password);
                })
                .then(function (response) {
                    var accessToken = response.data['access_token'];
                    return corbelDriver.oauth
                        .user(oauthCommon.getClientParams(), accessToken)
                        .delete('me');
                })
                .then(function(){
                    return corbelIamDriver.iam
                        .user(userId)
                        .delete();
                })
                .should.notify(done);
        });

        it('logged in using oauth identity', function(done){
            var setCookie = false;
            var noRedirect = false;

            corbelIamDriver.iam.users()
                .create(userIam)
                .then(function(id) {
                    userId = id;
                    return corbelIamDriver.iam
                        .user(userId)
                        .addIdentity({
                            'oauthService': 'silkroad',
                            'oauthId': oauthIdentifier
                        });
                })
                .then(function(){
                    return authorize
                        .login(userOauth.email, userOauth.password, setCookie, noRedirect);
                })
                .then(function(){
                    return corbelDriver.iam
                        .user()
                        .get('me');
                })
                .should.notify(done);
        });

        it('created user with identity and logged in using oauth identity', function(done){
            var setCookie = false;
            var noRedirect = false;

            corbelIamDriver.iam.users()
                .create({
                    'firstName': 'createUserIam' + random,
                    'email': 'createUserIam.iam.' + random + emailDomain,
                    'username': 'createUserIam.iam.' + random + emailDomain,
                    'identity': {
                        'oauthService': 'silkroad',
                        'oauthId': oauthIdentifier
                    }
                })
                .then(function(id) {
                    userId = id;
                    return authorize
                        .login(userOauth.email, userOauth.password, setCookie, noRedirect);
                })
                .then(function(){
                    return corbelDriver.iam
                        .user()
                        .get('me');
                })
                .should.notify(done);
        });
    });
});