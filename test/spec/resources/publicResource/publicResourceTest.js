describe('In RESOURCES module, while using public resources', function() {
    var corbelRootDriver;
    var corbelDriver;

    var domainId;
    var publicResourceTestCollection = 'test:PublicResource';
    var random;
    var currentResourcesEndpoint;

    var MAX_RETRY = 40;
    var RETRY_PERIOD = 1;

    beforeEach(function(done) {
        var domain;
        random = Date.now();

        corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();

        currentResourcesEndpoint = corbelRootDriver.config.getCurrentEndpoint('resources');

        var scopeId = 'scopeId-' + random;
        var audience = 'http://resources.bqws.io';
        var rules = [{
            mediaTypes: ['application/json'],
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
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

        domain = corbelTest.common.iam.getDomain(undefined, undefined, undefined, scopes, publicScopes);

        corbelRootDriver.iam.scope()
            .create(publicScope)
            .then(function() {
                return corbelRootDriver.iam.domain()
                    .create(domain);
            })
            .then(function(id) {
                domainId = id;
            })
            .should.notify(done);
    });

    describe('if a resource is public', function(done) {
        var resourceId;

        beforeEach(function(done) {
            var client = {
                name: 'testClient_' + random,
                signatureAlgorithm: 'HS256',
                domain: domainId,
                scopes: ['silkroad-qa:resources']
            };

            corbelRootDriver.domain(domainId).iam.client()
                .create(client)
                .then(function(clientId) {
                    return corbelRootDriver.domain(domainId).iam.client(clientId)
                        .get();
                })
                .then(function(response) {
                    var createdClient = response.data;
                    var confCreatedClient = corbelTest.getConfig();
                    confCreatedClient.clientId = createdClient.id;
                    confCreatedClient.clientSecret = createdClient.key;
                    confCreatedClient.scopes = createdClient.scopes.join(' ');
                    corbelDriver = corbelTest.getCustomDriver(confCreatedClient);

                    return corbelDriver.iam.token()
                        .create();
                })
                .then(function() {
                    var resourceTest = {
                        testField: 'testContent'
                    };

                    return corbelDriver.resources.collection(publicResourceTestCollection)
                        .add(resourceTest);
                })
                .then(function(id) {
                    resourceId = id;
                })
                .should.notify(done);
        });

        afterEach(function(done) {
            corbelDriver.resources.resource(publicResourceTestCollection, resourceId)
                .delete()
                .should.notify(done);
        });

        it('that can be consulted without token', function(done) {
            corbelTest.common.utils.retry(function() {
                    return corbel.request.send({
                            url: currentResourcesEndpoint + domainId + '/resource/' +
                                publicResourceTestCollection + '/' + resourceId,
                            method: corbel.request.method.GET,
                            headers: {
                                'Accept': 'application/json'
                            }
                        });
                }, MAX_RETRY, RETRY_PERIOD)
                .then(function(response) {
                    expect(response).to.have.deep.property('data.id', resourceId);
                })
                .should.notify(done);
        });

        it('that can be update without token', function(done) {
            corbelTest.common.utils.retry(function() {
                    return corbel.request.send({
                            url: currentResourcesEndpoint + domainId + '/resource/' +
                                publicResourceTestCollection + '/' + resourceId,
                            method: corbel.request.method.PUT,
                            headers: {
                                'Accept': 'application/json'
                            },
                            data: {
                                testField: 'testContentUpdated'
                            }

                        });
                }, MAX_RETRY, RETRY_PERIOD)
                .then(function() {
                    return corbel.request.send({
                            url: currentResourcesEndpoint + domainId + '/resource/' +
                                publicResourceTestCollection + '/' + resourceId,
                            method: corbel.request.method.GET,
                            headers: {
                                'Accept': 'application/json'
                            }

                        });
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.id', resourceId);
                    expect(response).to.have.deep.property('data.testField', 'testContentUpdated');
                })
                .should.notify(done);
        });

        it('that can be deleted without token', function(done) {
            corbelTest.common.utils.retry(function() {
                    return corbel.request.send({
                            url: currentResourcesEndpoint + domainId + '/resource/' +
                                publicResourceTestCollection + '/' + resourceId,
                            method: corbel.request.method.DELETE,
                            headers: {
                                'Accept': 'application/json'
                            }
                        })
                        .then(function() {
                            return corbel.request.send({
                                    url: currentResourcesEndpoint + domainId + '/resource/' +
                                        publicResourceTestCollection + '/' + resourceId,
                                    method: corbel.request.method.GET,
                                    headers: {
                                        'Accept': 'application/json'
                                    }

                                })
                                .should.be.rejected;
                        });
                }, MAX_RETRY, RETRY_PERIOD)
                .then(function(e) {
                    expect(e).to.have.property('status', 404);
                    expect(e).to.have.deep.property('data.error', 'not_found');
                })
                .should.notify(done);
        });
    });

    describe('if a resource public is added', function(done) {
        var resourceId;

        after(function(done) {
            corbel.request.send({
                    url: currentResourcesEndpoint + domainId + '/resource/' +
                        publicResourceTestCollection + '/' + resourceId,
                    method: corbel.request.method.DELETE,
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .should.notify(done);
        });

        it('that can be added without token', function(done) {
            corbelTest.common.utils.retry(function() {
                    return corbel.request.send({
                            url: currentResourcesEndpoint + domainId + '/resource/' +
                                publicResourceTestCollection,
                            method: corbel.request.method.POST,
                            headers: {
                                'Accept': 'application/json'
                            },
                            data: {
                                testField: 'testContent'
                            }
                        })
                        .then(function(response) {
                            var locationSplitBar = response.headers.location.split('/');
                            resourceId = locationSplitBar[locationSplitBar.length - 1];
                            return corbel.request.send({
                                    url: currentResourcesEndpoint + domainId + '/resource/' +
                                        publicResourceTestCollection + '/' + resourceId,
                                    method: corbel.request.method.GET,
                                    headers: {
                                        'Accept': 'application/json'
                                    }
                                });
                        });
                }, MAX_RETRY, RETRY_PERIOD)
                .then(function(response) {
                    expect(response).to.have.deep.property('data.id', resourceId);
                    expect(response).to.have.deep.property('data.testField', 'testContent');
                })
                .should.notify(done);
        });
    });
});
