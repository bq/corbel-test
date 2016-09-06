describe('In IAM module', function() {

    describe('for scope management', function() {
        var corbelRootDriver;
        var corbelDefaultDriver;

        before(function() {
            corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        });

        it('when create a composite scope with simple scope, and update them, logged user have new scopes',
            function(done) {
                var compositeScope = {
                    id: 'TestCompositeScope_' + Date.now(),
                    type: 'composite_scope'
                };

                var testScope = {
                    id: 'TestSimpleScope_' + Date.now(),
                    audience: 'http://iam.bqws.io',
                    rules: [{
                        mediaTypes: [
                            'application/json'
                        ],
                        methods: [
                            'GET'
                        ],
                        type: 'http_access',
                        uri: 'user/.*'
                    }]
                };

                var userData = {
                    email: 'myEmail' + Date.now() + '@funkifake.com',
                    username: 'new user' + Date.now(),
                    password: 'password',
                    scopes: [compositeScope.id]
                };

                var domain = {
                    id: 'newApp_' + Date.now(),
                    description: 'My new app',
                    scopes: ['iam:comp:base', testScope.id],
                    defaultScopes: ['iam:comp:base', testScope.id]
                };

                var client = {
                    name: 'client1',
                    signatureAlgorithm: 'HS256',
                    scopes: ['iam:comp:base', compositeScope.id]
                };

                corbelRootDriver.iam.scope()
                    .create(compositeScope)
                    .then(function() {
                        return corbelRootDriver.iam.scope()
                            .create(testScope);
                    }).then(function() {
                        return corbelRootDriver.iam.domain()
                            .create(domain);
                    }).then(function(id) {
                        domain.id = id;
                        return corbelRootDriver.domain(domain.id).iam.client()
                            .create(client);
                    }).then(function(id) {
                        client.id = id;
                        return corbelRootDriver.domain(domain.id).iam.client(client.id)
                            .get();
                    }).then(function(response) {
                        client = response.data;
                        corbelDefaultDriver = corbelTest.getCustomDriver({
                            'clientId': client.id,
                            'clientSecret': client.key,
                            'scopes': client.scopes.join(' ')
                        });
                        return corbelDefaultDriver.iam.token().create();
                    }).then(function(response) {
                        return corbelDefaultDriver.iam.users()
                            .create(userData);
                    }).then(function(id) {
                        userData.id = id;
                        return corbelTest.common.clients
                            .loginUser(corbelDefaultDriver, userData.username, userData.password);
                    }).then(function() {
                        return corbelDefaultDriver.iam.user(userData.id)
                            .get()
                            .should.be.rejected;
                    }).then(function() {
                        compositeScope.scopes = [testScope.id];
                        return corbelRootDriver.iam.scope()
                            .create(compositeScope);
                    }).then(function() {
                        return corbelDefaultDriver.iam.user('me')
                            .disconnect();
                    }).then(function() {
                        var MAX_RETRY = 30;
                        var RETRY_PERIOD = 1;
                        return corbelTest.common.utils.retry(function() {
                                return corbelTest.common.clients
                                    .loginUser(corbelDefaultDriver, userData.username, userData.password)
                                    .then(function() {
                                        return corbelDefaultDriver.iam.user(userData.id)
                                            .get();
                                    });
                            }, MAX_RETRY, RETRY_PERIOD);
                    })
                    .then(function() {
                        testScope.audience = 'badAudience';
                        return corbelRootDriver.iam.scope()
                            .create(testScope);
                    }).then(function() {
                        return corbelDefaultDriver.iam.user('me')
                            .disconnect();
                    }).then(function() {
                        var MAX_RETRY = 10;
                        var RETRY_PERIOD = 1;
                        return corbelTest.common.utils.retry(function() {
                                return corbelTest.common.clients
                                    .loginUser(corbelDefaultDriver, userData.username, userData.password)
                                    .then(function() {
                                        return corbelDefaultDriver.iam.user(userData.id)
                                            .get()
                                            .should.be.rejected;
                                    });
                            }, MAX_RETRY, RETRY_PERIOD);
                    })
                    .should.notify(done);
            });
    });
});
