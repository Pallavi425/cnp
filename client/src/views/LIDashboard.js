import React, { Component } from 'react';
import Land from "../artifacts/Land.json";
import getWeb3 from "../getWeb3";
import { Line, Bar } from "react-chartjs-2";
import '../index.css';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { DrizzleProvider } from 'drizzle-react';
import { Spinner } from 'react-bootstrap'
import {
    LoadingContainer,
    AccountData,
    ContractData,
    ContractForm
} from 'drizzle-react-components'

// reactstrap components
import {
    Button,
    ButtonGroup,
    Card,
    CardHeader,
    CardBody,
    CardTitle,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    UncontrolledDropdown,
    Label,
    FormGroup,
    Input,
    Table,
    Row,
    Col,
    UncontrolledTooltip,
} from "reactstrap";

// core components
import {
    chartExample1,
    chartExample2,
    chartExample3,
    chartExample4,
} from "../variables/charts";

const drizzleOptions = {
    contracts: [Land]
}

// var buyers = 0;
// var sellers = 0;
var sellerTable = [];
var buyerTable = [];
var landTable = [];
var completed = true;

class LIDashboard extends Component {
    constructor(props) {
        super(props)

        this.state = {
            LandInstance: undefined,
            account: null,
            web3: null,
            buyers: 0,
            sellers: 0,
            verified: '',
        }
    }

    // displayAlert = (item) => (event) => {
    //     // you can access the item object and the event object
    //     alert('Hi');
    //   }
    verifySeller = (item) => async () => {
        //console.log("Hello");
        //console.log(item);

        await this.state.LandInstance.methods.verifySeller(
            item
        ).send({
            from: this.state.account,
            gas: 2100000
        });

        //Reload
        window.location.reload(false);

    }

    verifyBuyer = (item) => async () => {
        //console.log("Hello");
        //console.log(item);

        await this.state.LandInstance.methods.verifyBuyer(
            item
        ).send({
            from: this.state.account,
            gas: 2100000
        });

        //Reload
        window.location.reload(false);

    }
    verifyLand = (landId) => async () => {

        await this.state.LandInstance.methods.verifyLand(
            landId
        ).send({
            from: this.state.account,
            gas: 2100000
        });
        //Reload
        // console.log(newOwner);
        console.log(completed);
        // this.setState({completed:false});
        completed = false;
        console.log(completed);

        window.location.reload(false);

    }


    componentDidMount = async () => {
        //For refreshing page only once
        if (!window.location.hash) {
            window.location = window.location + '#loaded';
            window.location.reload();
        }

        try {
            //Get network provider and web3 instance
            const web3 = await getWeb3();

            const accounts = await web3.eth.getAccounts();

            const currentAddress = await web3.currentProvider.selectedAddress;
            //console.log(currentAddress);
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = Land.networks[networkId];
            const instance = new web3.eth.Contract(
                Land.abi,
                deployedNetwork && deployedNetwork.address,
            );

            this.setState({ LandInstance: instance, web3: web3, account: accounts[0] });


            var sellersCount = await this.state.LandInstance.methods.getSellersCount().call();
            console.log(sellersCount);
            var buyersCount = await this.state.LandInstance.methods.getBuyersCount().call();
            console.log(buyersCount);
            var count = await this.state.LandInstance.methods.getLandsCount().call();
            count = parseInt(count);
            var rowsArea = [];
            var rowsLoc = [];
            var rowsSt = [];
            var rowsPrice = [];

            for (var i = 1; i < count + 1; i++) {
                rowsArea.push(<ContractData contract="Land" method="getArea" methodArgs={[i, { from: accounts[1] }]} />);
                rowsLoc.push(<ContractData contract="Land" method="getLocation" methodArgs={[i, { from: accounts[1] }]} />);
                rowsSt.push(<ContractData contract="Land" method="getStatus" methodArgs={[i, { from: accounts[1] }]} />);
                rowsPrice.push(<ContractData contract="Land" method="getPrice" methodArgs={[i, { from: accounts[1] }]} />);
            }
            for (var i = 0; i < count; i++) {
                // var request = await this.state.LandInstance.methods.getRequestDetails(i + 1).call();
                var landVerified = await this.state.LandInstance.methods.isLandVerified(i + 1).call();
                // console.log(approved);
                // console.log(request[3]);
                // var disabled = request[3] && completed;
                // console.log("Disabled: ", disabled);
                // console.log("request[3]: ", request[3]);
                // console.log("completed: ", completed);

                var owner = await this.state.LandInstance.methods.getLandOwner(i + 1).call();
                landTable.push(<tr><td>{i + 1}</td><td>{owner}</td><td>{rowsArea[i]}</td><td>{rowsLoc[i]}</td><td>{rowsPrice[i]}</td><td>{rowsSt[i]}</td>
                    <td>
                        <Button onClick={this.verifyLand(i + 1)} disabled={landVerified} className="button-vote">
                            Verify Land
                    </Button>
                    </td>
                </tr>)


            }

            var sellersMap = [];
            var buyersMap = [];
            sellersMap = await this.state.LandInstance.methods.getSeller().call();
            //console.log(sellersMap);
            buyersMap = await this.state.LandInstance.methods.getBuyer().call();
            //console.log(buyersMap);

            var verified = await this.state.LandInstance.methods.isLandInspector(currentAddress).call();
            //console.log(verified);
            this.setState({ verified: verified });


            for (let i = 0; i < sellersCount; i++) {
                var seller = await this.state.LandInstance.methods.getSellerDetails(sellersMap[i]).call();
                console.log(seller);
                var seller_verify = await this.state.LandInstance.methods.isVerified(sellersMap[i]).call();
                console.log(seller_verify);

                sellerTable.push(<tr><td>{i + 1}</td><td>{sellersMap[i]}</td><td>{seller[0]}</td><td>{seller[1]}</td><td>{seller[2]}</td><td>{seller[3]}</td><td>{seller[4]}</td>
                    <td>
                        <Button onClick={this.verifySeller(sellersMap[i])} disabled={seller_verify} className="button-vote">
                            Verify
                    </Button>
                    </td></tr>)


            }

            console.log(sellerTable);

            for (let i = 0; i < buyersCount; i++) {
                var buyer = await this.state.LandInstance.methods.getBuyerDetails(buyersMap[i]).call();
                //console.log(buyer);
                var buyer_verify = await this.state.LandInstance.methods.isVerified(buyersMap[i]).call();
                console.log(buyer_verify);

                buyerTable.push(<tr><td>{i + 1}</td><td>{buyersMap[i]}</td><td>{buyer[0]}</td><td>{buyer[1]}</td><td>{buyer[2]}</td><td>{buyer[3]}</td><td>{buyer[4]}</td><td>{buyer[5]}</td>
                    <td>
                        <Button onClick={this.verifyBuyer(buyersMap[i])} disabled={buyer_verify} className="button-vote">
                            Verify
                    </Button>
                    </td>
                </tr>)

            }

        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    };



    render() {
        if (!this.state.web3) {
            return (
                <div>
                    <div>
                        <h1>
                            <Spinner animation="border" variant="primary" />
                        </h1>
                    </div>

                </div>
            );
        }

        if (!this.state.verified) {
            return (
                <div className="content">
                    <div>
                        <Row>
                            <Col xs="6">
                                <Card className="card-chart">
                                    <CardBody>
                                        <h1>
                                            You are not verified to view this page
                                        </h1>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </div>

                </div>
            );
        }

        return (
            <DrizzleProvider options={drizzleOptions}>
                <LoadingContainer>
                    <div className="content">

                        <Row>
                            <Col lg="4">
                                <Card className="card-chart">
                                    <CardHeader>
                                        <h5 className="card-category">Total Requests for land</h5>
                                        <CardTitle tag="h3">
                                            <i className="tim-icons icon-bell-55 text-info" /> 10
                                         </CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="chart-area">
                                            <Line
                                                data={chartExample2.data}
                                                options={chartExample2.options}
                                            />
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col lg="4">
                                <Card className="card-chart">
                                    <CardHeader>
                                        <h5 className="card-category">Daily Transactions</h5>
                                        <CardTitle tag="h3">
                                            <i className="tim-icons icon-delivery-fast text-primary" />{" "}
                    3-5
                  </CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="chart-area">
                                            <Bar
                                                data={chartExample3.data}
                                                options={chartExample3.options}
                                            />
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col lg="4">
                                <Card className="card-chart">
                                    <CardHeader>
                                        <h5 className="card-category">Successful Transactions</h5>
                                        <CardTitle tag="h3">
                                            <i className="tim-icons icon-send text-success" /> 120
                  </CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="chart-area">
                                            <Line
                                                data={chartExample4.data}
                                                options={chartExample4.options}
                                            />
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs="12">
                                <Card>
                                    <CardHeader>
                                        <CardTitle tag="h4">Sellers Info</CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        <Table sclassName="tablesorter" responsive color="black">
                                            <thead className="text-primary">
                                                <tr>
                                                    <th>#</th>
                                                    <th>Account Address</th>
                                                    <th>Name</th>
                                                    <th>Age</th>
                                                    <th>Aadhar Number</th>
                                                    <th>Pan Number</th>
                                                    <th>Owned Lands</th>
                                                    <th>Verify Seller</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sellerTable}
                                            </tbody>

                                        </Table>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs="12">
                                <Card>
                                    <CardHeader>
                                        <CardTitle tag="h5">Buyers Info</CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        <Table className="tablesorter" responsive color="black">
                                            <thead className="text-primary">
                                                <tr>
                                                    <th>#</th>
                                                    <th>Account Address</th>
                                                    <th>Name</th>
                                                    <th>Age</th>
                                                    <th>City</th>
                                                    <th>State</th>
                                                    <th>Aadhar Number</th>
                                                    <th>Pan Number</th>
                                                    <th>Verify Buyer</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {buyerTable}
                                            </tbody>

                                        </Table>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs="12">
                                <Card>
                                    <CardHeader>
                                        <CardTitle tag="h6">Lands Info</CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        <Table className="tablesorter" responsive color="black">
                                            <thead className="text-primary">
                                                <tr>
                                                    <th>#</th>
                                                    <th>Land Owner</th>
                                                    <th>Area</th>
                                                    <th>Location</th>
                                                    <th>Price</th>
                                                    <th>Status</th>
                                                    <th>Verify Land</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {landTable}
                                            </tbody>
                                        </Table>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                        <Row>
                            <Col lg="4">
                                <Card>
                                    <CardHeader>
                                        <h5 className="title">Land Ownership Transfers</h5>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="chart-area">

                                            <Button href="/ApproveTransaction" className="btn-fill" color="primary">
                                                View all Land Ownership Transfer Requests
                                            </Button>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>

                    </div>
                </LoadingContainer>
            </DrizzleProvider>
        );

    }
}

export default LIDashboard;