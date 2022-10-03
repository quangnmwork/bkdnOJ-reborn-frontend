import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './Footer.scss';
import uniFlag from 'assets/images/bkdn-uni-banner-gray-transparent.png';

/*
    FOOTER
    ------- | ------------------------
    School  |   Link Categories
    Info    |   Cate 1 ------
            |    > link  > link
    ------- | ------------------------
        Thankyou, creator,
          inspiration...

*/

export default class Footer extends React.Component {
    render() {
        return (
            <footer className='footer'>
                <Container>
                    <Row className="upper-row">
                        <Col xs={12} md={4} className="col school-info-section">
                            <p className="bkdn-uni-container">
                                <img className='bkdn-uni-flag' src={uniFlag} alt="Flag of Danang University of Science and Technology"/>
                            </p>
                        </Col>

                        <Col xs={12} md={8} className="col link-section">
                            <div className="subcategory">
                                <h4>Về chúng tôi</h4>
                                <p>
                                    <a href="https://dut.udn.vn/">Đại học Bách Khoa - Đại học Đà Nẵng</a>
                                    <a href="http://dut.udn.vn/KhoaCNTT">Khoa CNTT</a>
                                    <a href="#">Đội IOI{"&"}ICPC BKĐN</a>
                                    <a href="https://github.com/BKDN-University">Đội phát triển bkdnOJ v2.0</a>
                                </p>
                            </div>

                            <div className="subcategory">
                                <h4>Đường dẫn liên quan</h4>
                                <p>
                                    <a href="https://icpc.global/regionals/abouticpc">About ICPC</a>
                                    <a href="https://www.olp.vn/">Olympic Tin học VN</a>
                                    <a href="https://vnoi.info/">Diễn đàn Tin học VNOI</a>
                                </p>
                            </div>

                            <div className="subcategory">
                                <h4>Các OJ khác</h4>
                                <p>
                                    <a href="https://codeforces.com/">Codeforces</a>
                                    <a href="https://atcoder.jp/">AtCoder</a>
                                    <a href="https://dmoj.ca/">DMOJ</a>
                                    <a href="https://onlinejudge.org/index.php">UVaOJ</a>
                                    <a href="https://oj.vnoi.info/">VNOJ</a>
                                    <a href="https://onlinejudge.u-aizu.ac.jp/home">AizuOJ</a>
                                    <a href="https://lqdoj.edu.vn/">LQDOJ</a>
                                    <a href="http://ntucoder.net/">NtuCoder</a>
                                </p>
                            </div>

                        </Col>
                    </Row>

                    <Row className="lower-row">
                        <Col xs={12} className="col">
                            <pre id="footer-note">
                                bkdnOJ v2.0 - open.Beta - 2022{"\n"}
                                Build by BKDN Informatics Olympic {"&"} ICPC Team{"\n"}
                                University of Science and Technology - University of Danang{"\n"}
                            </pre>
                        </Col>
                    </Row>
                </Container>
            </footer>
        )
    }
}