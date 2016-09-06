describe('In IAM module', function() {

    describe('when performing domain CRUD operations', function() {
        var CorbelDriver;

        before(function() {
            CorbelDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        });

        var createDomains = function(amount, timeStamp, desc) {
            var promises = [];
            for (var count = 1; count <= amount; count++) {
                var domain = corbelTest.common.iam.getDomain(timeStamp, desc, count);
                var promise = CorbelDriver.iam.domain()
                .create(domain)
                .should.be.fulfilled;
                promises.push(promise);
            }
            return Promise.all(promises);
        };

        it('a domain is created', function(done) {
            var expectedDomain = {
                id: 'TestDomain_' + Date.now(),
                description: 'anyDescription',
                scopes: ['iam:user:create', 'iam:user:read', 'iam:user:delete', 'iam:user:me'],
                publicScopes: []
            };
            CorbelDriver.iam.domain()
            .create(expectedDomain)
            .should.be.fulfilled
            .then(function(id) {
                expect(id).to.be.equals(corbelTest.CONFIG.DOMAIN  + ':' + expectedDomain.id);
                return CorbelDriver.domain(id).iam.domain()
                .get()
                .should.be.fulfilled;
            })
            .then(function(domain) {
                expectedDomain.id = corbelTest.CONFIG.DOMAIN  + ':' + expectedDomain.id;
                expect(domain).to.have.deep.property('data.id', expectedDomain.id);
                expect(domain).to.have.deep.property('data.description', expectedDomain.description);
                domain.data.scopes.forEach(function(scope){
                    expect(expectedDomain.scopes).to.contain(scope); 
                });
            })
            .should.be.fulfilled.and.notify(done);
        });

        it('a domain is updated', function(done) {
            var expectedDomain = {
                id: 'TestDomain_' + Date.now(),
                description: 'anyDescription',
                scopes: ['iam:user:create', 'iam:user:read', 'iam:user:delete', 'iam:user:me'],
                publicScopes: []
            };
            var newDescription = 'salerjiioejjsadroaeho';
            CorbelDriver.iam.domain()
            .create(expectedDomain)
            .should.be.fulfilled
            .then(function(id) {
                var newDomain = {
                    description: newDescription
                };
                expectedDomain.id = corbelTest.CONFIG.DOMAIN  + ':' + expectedDomain.id;
                return CorbelDriver.domain(id).iam.domain()
                .update(newDomain)
                .should.be.fulfilled;
            })
            .then(function() {
                return CorbelDriver.domain(expectedDomain.id).iam.domain()
                .get()
                .should.be.fulfilled;
            })
            .then(function(domain) {
                expect(domain).to.have.deep.property('data.id', expectedDomain.id);
                expect(domain).to.have.deep.property('data.description', newDescription);
            })
            .should.be.fulfilled.and.notify(done);
        });

        it('a domain is removed', function (done) {
            var expectedDomain = {
                id: 'TestDomain_' + Date.now(),
                description: 'anyDescription',
                scopes: ['iam:user:create', 'iam:user:read', 'iam:user:delete', 'iam:user:me'],
                publicScopes: []
            };

            CorbelDriver.iam.domain()
            .create(expectedDomain)
            .should.be.fulfilled
            .then(function(id) {
                expect(id).to.be.equals(corbelTest.CONFIG.DOMAIN  + ':' + expectedDomain.id);
                return CorbelDriver.domain(id).iam.domain()
                .get()
                .should.be.fulfilled;
            })
            .then(function(domain) {
                expectedDomain.id = corbelTest.CONFIG.DOMAIN  + ':' + expectedDomain.id;
                expect(domain).to.have.deep.property('data.id', expectedDomain.id);
                expect(domain).to.have.deep.property('data.description', expectedDomain.description);
                domain.data.scopes.forEach(function(scope){
                    expect(expectedDomain.scopes).to.contain(scope); 
                });
            })
            .then(function(){
              return CorbelDriver.domain(expectedDomain.id).iam.domain()
              .remove()
              .should.be.fulfilled;
            })
            .then(function() {
                return CorbelDriver.domain(expectedDomain.id).iam.domain()
                .get()
                .should.be.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.be.fulfilled.and.notify(done);
        });

        it('all domains are gotten', function(done) {
            var timeStamp = Date.now();
            var domainDescription = 'desc-' + timeStamp;
            var createdDomainIds;

            createDomains(5, timeStamp, domainDescription)
            .should.be.fulfilled
            .then(function(obtainedCreatedDomainIds) {
                createdDomainIds = obtainedCreatedDomainIds;

                var params = {
                    query: [{
                        '$eq': {
                            description: domainDescription
                        }
                    }]
                };

                return CorbelDriver.iam.domain()
                .getAll(params)
                .should.be.fulfilled;
            })
            .then(function(domains) {
                domains.data.forEach(function(domain) {
                    expect(domain).to.have.property('id');
                    expect(createdDomainIds).to.contain(domain.id);
                });
            }).
            should.be.fulfilled.and.notify(done);
        });
    });
});
