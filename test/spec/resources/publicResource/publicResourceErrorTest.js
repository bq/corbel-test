describe('In RESOURCES module, a resource is public', function() {
    var corbelRootDriver;
    var corbelDriver;
    var domainId;
    var publicResourceTestCollection = 'test:PublicResource';
    var currentResourcesEndpoint;
    var resourceId;
    var scopes;
    var random;

    var createPublicResource = function(scopes, publicScopes) {

        random = Date.now();
        var client = {
            name: 'testClient_' + random,
            signatureAlgorithm: 'HS256',
            scopes: ['silkroad-qa:resources']
        };
        var promise;

        var domain = corbelTest.common.iam.getDomain(undefined, undefined, undefined, scopes, publicScopes);

        promise = corbelRootDriver.iam.domain()
            .create(domain)
            .should.be.eventually.fulfilled
            .then(function(id) {
                domainId = id;
                client.domain=domainId;
                return corbelRootDriver.iam.client(domainId)
                    .create(client)
                    .should.be.eventually.fulfilled;
            })
            .then(function(clientId) {
                return corbelRootDriver.iam.client(domainId, clientId)
                    .get()
                    .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                var createdClient = response.data;
                var confCreatedClient = corbelTest.getConfig();
                confCreatedClient.clientId = createdClient.id;
                confCreatedClient.clientSecret = createdClient.key;
                confCreatedClient.scopes = createdClient.scopes.join(' ');
                corbelDriver = corbel.getDriver(confCreatedClient);

                return corbelDriver.iam.token()
                    .create();
            })
            .then(function() {
                var resourceTest = {
                    testField: 'testContent'
                };

                return corbelDriver.resources.collection(publicResourceTestCollection)
                    .add(resourceTest).should.be.eventually.fulfilled;

            });
        return promise;
    };

    before(function() {
        corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
    });

    after(function(done) {
        corbelDriver.resources.resource(publicResourceTestCollection, resourceId)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.domain(domainId)
                    .remove()
                    .should.be.eventually.fulfilled;
            })
            .should.notify(done);
    });

    describe('when the request don\'t have public scope', function(done) {

        before(function(done) {
            scopes = ['silkroad-qa:resources'];
            createPublicResource(scopes, undefined).should.be.eventually.fulfilled
                .then(function(id) {
                    resourceId = id;
                })
                .should.notify(done);
        });

        it('an error ocurred when public scope is not in the domain', function(done) {
            currentResourcesEndpoint = corbelTest.CONFIG.COMMON.urlBase
                .replace('{{module}}', corbel.Resources.moduleName);
            corbel.request.send({
                    url: currentResourcesEndpoint + domainId + '/resource/' +
                        publicResourceTestCollection + '/' + resourceId,
                    method: corbel.request.method.GET,
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .should.be.eventually.rejected
                .then(function(response) {
                    expect(response).to.have.property('status', 401);
                    expect(response.data).to.have.property('error', 'invalid_token');
                })
                .should.notify(done);
        });
    });

    describe('when the request don\'t have public scope for retrieve', function(done) {

        before(function(done) {
            random = Date.now();

            var scopeId = 'scopeId-' + random;
            var audience = 'http://resources.bqws.io';
            var rules = [{
                mediaTypes: ['application/json'],
                methods: ['POST', 'PUT', 'DELETE'],
                type: 'http_access',
                uri: 'resource/' + publicResourceTestCollection + '(/.*)?'
            }];

            var publicScope = {
                id: scopeId,
                audience: audience,
                rules: rules
            };

            var publicScopes = [scopeId];
            var scopes = ['silkroad-qa:resources', scopeId];

            corbelRootDriver.iam.scope()
                .create(publicScope)
                .should.be.eventually.fulfilled
                .then(function() {
                    return createPublicResource(scopes, publicScopes).should.be.eventually.fulfilled;
                })
                .then(function(id) {
                    resourceId = id;
                })
                .should.notify(done);
        });

        it('and error ocuurred', function(done) {
            currentResourcesEndpoint = corbelTest.CONFIG.COMMON.urlBase
                .replace('{{module}}', corbel.Resources.moduleName);
            corbel.request.send({
                    url: currentResourcesEndpoint + domainId + '/resource/' +
                        publicResourceTestCollection + '/' + resourceId,
                    method: corbel.request.method.GET,
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .should.be.eventually.rejected
                .then(function(response) {
                    expect(response).to.have.property('status', 401);
                    expect(response.data).to.have.property('error', 'invalid_token');
                })
                .should.notify(done);
        });
    });
});
