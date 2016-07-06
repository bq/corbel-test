describe('In RESOURCES module', function() {

    describe('In RESMI module, while testing distinctfield in collection', function() {
        var corbelDriver;
        var COLLECTION = 'test:CorbelJSObjectistinct' + Date.now();
        var amount = 50;

        before(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
            corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION, amount)
                .should.be.eventually.fulfilled.and.notify(done);

        });

        after(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                .should.be.eventually.fulfilled.and.notify(done);
        });



        it('distinct  elements in a collection are gotten', function(done) {
            var params = {
                distinctfield: 'distinctField'
            };

            corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 2);
                    response.data.forEach(function(element) {
                        expect([0, 1]).to.include(element);
                    });
                })
                .should.notify(done);
        });

        it('distinct  values of a field in a collection are gotten', function(done) {
            var params = {
                distinctfield: 'distinctField2'
            };
            var posiblesValues = [0, 1, 2, 3];
            corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 4);
                    response.data.forEach(function(element) {
                        expect(posiblesValues).to.include(element);
                    });
                })
                .should.notify(done);
        });

        it('elements  of a collection are gotten using distinctfield and a query', function(done) {
            var params = {
                distinctfield: 'distinctField2',
                query: [{
                    '$gte': {
                        intField: 300
                    }
                }, {
                    '$lte': {
                        intField: 500
                    }
                }]
            };
            var posiblesValues = [0, 1, 2, 3];

            corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 3);
                    response.data.forEach(function(element) {
                        expect(posiblesValues).to.include(element);
                    });
                })
                .should.notify(done);
        });

    });
});
