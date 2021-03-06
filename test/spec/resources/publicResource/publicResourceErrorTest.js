describe('In RESOURCES module, while using public resources', function() {
    var corbelRootDriver;
    var corbelDriver;
    var domainId;
    var resourceId;
    var scopes;
    var random;
    var publicResourceTestCollection = 'test:PublicResource';
    var currentResourcesEndpoint;

    var createPublicResource = function(scopes, publicScopes) {

        random = Date.now();
        var client = {
            name: 'testClient_' + random,
            signatureAlgorithm: 'HS256',
            scopes: ['silkroad-qa:resources']
        };
        var promise;

        var domain = corbelTest.common.iam.getDomain(undefined, undefined, undefined, scopes, publicScopes);

        return corbelRootDriver.iam.domain().create(domain)
        .then(function(id) {
            domainId = id;
            client.domain=domainId;
            return corbelRootDriver.domain(domainId).iam.client().create(client);
        })
        .then(function(clientId) {
            return corbelRootDriver.domain(domainId).iam.client(clientId).get();
        })
        .then(function(response) {
            var createdClient = response.data;
            var confCreatedClient = corbelTest.getConfig();
            confCreatedClient.clientId = createdClient.id;
            confCreatedClient.clientSecret = createdClient.key;
            confCreatedClient.scopes = createdClient.scopes.join(' ');
            corbelDriver = corbelTest.getCustomDriver(confCreatedClient);

            return corbelDriver.iam.token().create();
        })
        .then(function() {
            var resourceTest = {
                testField: 'testContent'
            };

            return corbelDriver.resources.collection(publicResourceTestCollection).add(resourceTest);
        });
    };

    before(function() {
        corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        currentResourcesEndpoint = corbelRootDriver.config.getCurrentEndpoint('resources');
    });

    after(function(done) {
        corbelDriver.resources.resource(publicResourceTestCollection, resourceId).delete()
        .then(function() {
            return corbelRootDriver.domain(domainId).iam.domain().remove();
        })
        .should.notify(done);
    });

    describe('when the resources does not have a public scope', function(done) {

        before(function(done) {
            scopes = ['silkroad-qa:resources'];
            createPublicResource(scopes, undefined)
            .then(function(id) {
                resourceId = id;
            })
            .should.notify(done);
        });

        it('a 401 error is raised', function(done) {

            corbel.request.send({
                url: currentResourcesEndpoint + domainId + '/resource/' +
                    publicResourceTestCollection + '/' + resourceId,
                method: corbel.request.method.GET,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .should.be.rejected
            .then(function(response) {
                expect(response).to.have.property('status', 401);
                expect(response).to.have.deep.property('data.error', 'invalid_token');
            })
            .should.notify(done);
        });
    });

    describe('when the resource has a public scope but the GET method', function(done) {

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

            corbelRootDriver.iam.scope().create(publicScope)
            .then(function() {
                return createPublicResource(scopes, publicScopes);
            })
            .then(function(id) {
                resourceId = id;
            })
            .should.notify(done);
        });

        it('a 401 error is raised', function(done) {

            corbel.request.send({
                url: currentResourcesEndpoint + domainId + '/resource/' +
                    publicResourceTestCollection + '/' + resourceId,
                method: corbel.request.method.GET,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .should.be.rejected
            .then(function(response) {
                expect(response).to.have.property('status', 401);
                expect(response).to.have.deep.property('data.error', 'invalid_token');
            })
            .should.notify(done);
        });
    });
});
