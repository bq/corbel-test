describe('In IAM module', function() {

    describe('when performing domain CRUD operations', function() {
        var corbelDriver;
        var corbelDefaultDriver;

        before(function() {
            corbelDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
            corbelDefaultDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        it('an error 422 is returned when try to create an empty domain', function(done) {
            corbelDriver.iam.domain()
            .create({})
            .should.be.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');
            })
            .should.notify(done);
        });

        it('an error 409 is returned while trying to create an existent domain', function(done) {
            var expectedDomain = {
                id: 'TestDomain_' + Date.now(),
                description: 'anyDescription',
                scopes: ['iam:user:create', 'iam:user:read', 'iam:user:delete', 'iam:user:me'],
                publicScopes: []
            };
            corbelDriver.iam.domain()
            .create(expectedDomain)
            .then(function(id) {
                expect(id).to.be.equal(corbelTest.CONFIG.DOMAIN  + ':' + expectedDomain.id);
                return corbelDriver.domain(id).iam.domain()
                .get();
            })
            .then(function(domain) {
                expect(domain).to.have.deep.property('data.id', corbelTest.CONFIG.DOMAIN  + ':' + expectedDomain.id);
                return corbelDriver.iam.domain()
                .create(expectedDomain)
                .should.be.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 409);
                expect(e).to.have.deep.property('data.error', 'entity_exists');
            })
            .should.notify(done);
        });

        it('an error 422 is returned while trying to create a domain with : inside the id', function(done) {
            var expectedDomain = {
                id: 'TestDomain:' + Date.now(),
                description: 'anyDescription',
                scopes: ['iam:user:create', 'iam:user:read', 'iam:user:delete', 'iam:user:me'],
                publicScopes: []
            };
            corbelDriver.iam.domain()
            .create(expectedDomain)
            .should.be.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_domain_id');
            })
            .should.notify(done);
        });

        it('an error 401 is returned while trying to create a domain without authorization', function(done) {
            var expectedDomain = {
                id: 'TestDomain_' + Date.now(),
                description: 'anyDescription',
                scopes: ['iam:user:create', 'iam:user:read', 'iam:user:delete', 'iam:user:me'],
                publicScopes: []
            };
            corbelDefaultDriver.iam.domain()
            .create(expectedDomain)
            .should.be.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized_token');
            })
            .should.notify(done);
        });

        it('an error 404 is returned while trying to modify the domain id', function(done) {
            var expectedDomain = {
                id: 'TestDomain_' + Date.now(),
                description: 'anyDescription',
                scopes: ['iam:user:create', 'iam:user:read', 'iam:user:delete', 'iam:user:me'],
                publicScopes: []
            };
            var updateDomainId = corbelTest.CONFIG.DOMAIN  + ':' + 'anyDomain:test';
            var domainId;
            corbelDriver.iam.domain()
            .create(expectedDomain)
            .then(function(id) {
                domainId = id;
                expect(domainId).to.be.equals(corbelTest.CONFIG.DOMAIN  + ':' + expectedDomain.id);
                return corbelDriver.domain(domainId).iam.domain()
                .update({id:updateDomainId});
            })
            .then(function() {
                return corbelDriver.domain(updateDomainId).iam.domain()
                .get()
                .should.be.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
                return corbelDriver.domain(domainId).iam.domain()
                .remove();
            })
            .should.notify(done);
        });

        it('an error 404 is returned while trying to get a domain which does not exist', function(done) {
            var id = corbelTest.CONFIG.DOMAIN  + ':' + Date.now();
            corbelDriver.domain(id).iam.domain()
            .get()
            .should.be.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('an error 401 is returned while trying to get a domain without authorization', function(done) {
            corbelDefaultDriver.domain(Date.now()).iam.domain()
            .get()
            .should.be.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized_token');
            })
            .should.notify(done);
        });

        it('an error 400 is returned while trying to get all domains using invalid query params',
        function(done) {
            var params = {
                query: [{
                    '$sum': {
                        description: 'domainDescription'
                    }
                }]
            };
            corbelDriver.iam.domain()
            .getAll(params)
            .should.be.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 400);
                expect(e).to.have.deep.property('data.error', 'invalid_query');
            })
            .should.notify(done);
        });

        it('an error 401 is returned while trying to update a domain without authorization', function(done) {
            var expectedDomain = {
                id: 'TestDomain_' + Date.now(),
                description: 'anyDescription',
                scopes: ['iam:user:create', 'iam:user:read', 'iam:user:delete', 'iam:user:me'],
                publicScopes: []
            };
            corbelDefaultDriver.domain(Date.now()).iam.domain()
            .update(expectedDomain)
            .should.be.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized_token');
            })
            .should.notify(done);
        });

        it('an error 422 is returned while trying to update a domain with malformed entity', function(done) {
            corbelDriver.iam.domain()
            .update('asdf')
            .should.be.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');
            })
            .should.notify(done);
        });

        it('an error 401 is returned while trying to delete a domain without authorization', function(done) {
            corbelDefaultDriver.domain(Date.now()).iam.domain()
            .remove()
            .should.be.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized_token');
            })
            .should.notify(done);
        });
    });
});
