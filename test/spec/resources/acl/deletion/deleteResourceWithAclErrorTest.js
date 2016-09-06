describe('In RESOURCES module', function() {

    describe('In ACL module', function() {

        describe('while testing delete resources', function() {
            var corbelDriver;
            var corbelAdminDriver;
            var corbelRootDriver;
            var COLLECTION_NAME;
            var DOMAIN = 'silkroad-qa';
            var user;
            var adminUser;
            var resourceId;
            var random;
            var usersId;
            var groupId;
            var TEST_OBJECT;
            var aclConfigurationId;

            beforeEach(function(done) {
                COLLECTION_NAME = 'test:testAcl' + Date.now();
                corbelRootDriver = corbelTest.drivers['ADMIN_USER'].clone();
                corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                corbelAdminDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                usersId = [];
                groupId = 'testGroup' + Date.now();

                random = Date.now();
                TEST_OBJECT = {
                    test: 'test' + random,
                    test2: 'test2' + random
                };

                corbelTest.common.resources.setManagedCollection(
                        corbelRootDriver, DOMAIN, COLLECTION_NAME)
                    .then(function(id) {
                        aclConfigurationId = id;
                        return corbelTest.common.iam.createUsers(corbelAdminDriver, 1);
                    })
                    .then(function(createdUser) {
                        adminUser = createdUser[0];
                        usersId.push(adminUser.id);

                        return corbelTest.common.iam.createUsers(corbelDriver, 1, {
                                'groups': [groupId]
                            });
                    })
                    .then(function(createdUser) {
                        user = createdUser[0];
                        usersId.push(user.id);

                        return corbelTest.common.clients
                            .loginUser(corbelAdminDriver, adminUser.username, adminUser.password);
                    })
                    .then(function() {
                        return corbelTest.common.clients.loginUser(corbelDriver, user.username, user.password);
                    })
                    .then(function() {
                        return corbelAdminDriver.resources.collection(COLLECTION_NAME)
                            .add(TEST_OBJECT);
                    })
                    .then(function(id) {
                        resourceId = id;
                    })
                    .should.notify(done);
            });


            afterEach(function(done) {
                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .delete()
                    .then(function(id) {
                        return corbelTest.common.resources.unsetManagedCollection(
                                corbelRootDriver, DOMAIN, COLLECTION_NAME, aclConfigurationId);
                    })
                    .then(function() {
                        var promises = usersId.map(function(userId) {
                            return corbelRootDriver.iam.user(userId)
                                .delete();
                        });

                        return Promise.all(promises);
                    })
                    .should.notify(done);
            });

            it('an error [401] is returned if the user only has WRITE permission', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] = {
                    permission: 'ADMIN'
                };
                ACL['user:' + user.id] = {
                    permission: 'WRITE'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {
                        dataType: 'application/corbel.acl+json'
                    })
                    .then(function() {

                        return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                            .delete()
                            .should.be.rejected;
                    })
                    .then(function(e) {
                        expect(e).to.have.property('status', 401);
                        expect(e).to.have.deep.property('data.error', 'unauthorized');
                    })
                    .should.notify(done);
            });

            it('an error [401] is returned if the users group only has WRITE permission', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] = {
                    permission: 'ADMIN'
                };
                ACL['group:' + groupId] = {
                    permission: 'WRITE'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {
                        dataType: 'application/corbel.acl+json'
                    })
                    .then(function() {
                        return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                            .delete()
                            .should.be.rejected;
                    })
                    .then(function(e) {
                        expect(e).to.have.property('status', 401);
                        expect(e).to.have.deep.property('data.error', 'unauthorized');
                    })
                    .should.notify(done);
            });

            it('an error [401] is returned if the user only has READ permission', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] = {
                    permission: 'ADMIN'
                };
                ACL['user:' + user.id] = {
                    permission: 'READ'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {
                        dataType: 'application/corbel.acl+json'
                    })
                    .then(function() {
                        return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                            .delete()
                            .should.be.rejected;
                    })
                    .then(function(e) {
                        expect(e).to.have.property('status', 401);
                        expect(e).to.have.deep.property('data.error', 'unauthorized');
                    })
                    .should.notify(done);
            });

            it('an error [401] is returned if the users group only has READ permission', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] = {
                    permission: 'ADMIN'
                };
                ACL['group:' + groupId] = {
                    permission: 'READ'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {
                        dataType: 'application/corbel.acl+json'
                    })
                    .then(function() {
                        return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                            .delete()
                            .should.be.rejected;
                    })
                    .then(function(e) {
                        expect(e).to.have.property('status', 401);
                        expect(e).to.have.deep.property('data.error', 'unauthorized');
                    })
                    .should.notify(done);
            });
        });
    });
});
