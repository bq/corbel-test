describe('In IAM module', function() {
    var corbelRootDriver;
    var corbelDefaultDriver;

    before(function() {
        corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        corbelDefaultDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
    });

    describe('when performing client CRUD operations', function() {
        var timeStamp;
        var scope1;
        var scope2;
        var domainId;

        before(function(done) {
            timeStamp = Date.now();
            return corbelRootDriver.iam.scope()
            .create(corbelTest.common.iam.getScope('TestScope1_' + timeStamp))
            .then(function(id) {
                scope1 = id;
                return corbelRootDriver.iam.scope()
                .create(corbelTest.common.iam.getScope('TestScope2_' + timeStamp));
            })
            .then(function(id) {
                scope2 = id; 
                return corbelRootDriver.iam.domain()
                .create(corbelTest.common.iam.getDomain());
            })
            .then(function(id) {
                domainId = id;
            })
            .notify(done);
        });

        after(function(done) {
            return corbelRootDriver.domain(domainId).iam.domain()
            .remove()
            .then(function() {
                return corbelRootDriver.iam.scope(scope1)
                .remove(scope1);
            })
            .then(function() {
                return corbelRootDriver.iam.scope(scope2)
                .remove(scope2);
            })
            .notify(done);
        });

        it('an error 409 is returned when try to create an existing client', function(done) {
            var client = {
                name: 'testClient_' + Date.now(),
                signatureAlgorithm: 'HS256',
                scopes: ['iam:user:create', 'iam:user:read', 'iam:user:delete', 'iam:user:me']
                };
            var clientId;

            corbelRootDriver.domain(domainId).iam.client()
            .create(client)
            .then(function(id) {
                clientId = id;
                return corbelRootDriver.domain(domainId).iam.client()
                .create(client)
                .should.be.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 409);
                expect(e).to.have.deep.property('data.error', 'conflict');
                return corbelRootDriver.domain(domainId).iam.client(clientId)
                .remove();
            })
            .notify(done);
        });

        it('an error 403 is returned when try to create a client with more scopes than his domain', function(done) {
            corbelRootDriver.domain(domainId).iam.client()
            .create({
                name: 'TestClient_' + timeStamp,
                scopes: [scope1, scope2]
            })
            .should.be.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 403);
                expect(e).to.have.deep.property('data.error', 'scopes_not_allowed');
            })
            .should.notify(done);
        });

        it('an error 401 is returned when try to create a client without authorization', function(done) {
            var id = Date.now();
            corbelDefaultDriver.domain(domainId).iam.client()
            .create({})
            .should.be.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized_token');
            })
            .should.notify(done);
        });

        it('an error 422 is returned when try to create a client with malformed data', function(done) {
            var id = Date.now();
            corbelRootDriver.domain(domainId).iam.client()
            .create({})
            .should.be.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');
            })
            .should.notify(done);
        });

        it('an error 404 is returned when try to get a client which does not exist', function(done) {
            var id = Date.now();
            corbelRootDriver.domain(domainId).iam.client(id)
            .get()
            .should.be.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('an error 401 is returned when try to get a client without authorization', function(done) {
            var id = Date.now();
            corbelDefaultDriver.domain(domainId).iam.client(null)
            .get()
            .should.be.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized_token');
            })
            .should.notify(done);
        });

        it('an error 401 is returned when try to update a client without authorization', function(done) {
            var id = Date.now();
            corbelDefaultDriver.domain(domainId).iam.client(id)
            .update({})
            .should.be.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized_token');
            })
            .should.notify(done);
        });

        it('an error 401 is returned when try to remove a client without authorization', function(done) {
            var id = Date.now();
            corbelDefaultDriver.domain(domainId).iam.client(id)
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
