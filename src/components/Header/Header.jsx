import React from 'react';
import { Link } from 'react-router-dom';

import { Modal, Button, Container } from 'react-bootstrap';
import { VscBug } from 'react-icons/vsc';

import flag from 'assets/images/bkdnoj-dropflag.png';
import './Header.scss';

export default class Header extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            show: false,
        };
    }
    handleClose(){ this.setState({show : false}); }
    handleOpen(){ this.setState({show : true}); }

    render() {
        const github = "https://github.com/BKDN-University/bkdnOJ-v2";

        return (
            <div className='header'>
                <Container>
                    <div className='site-logo d-none d-md-block'>
                        <Link to="/">
                            <img src={flag} alt="Drop down Flag with BKDN icon and Online Judge text" />
                        </Link>
                    </div>
                    <span>bkdnOJ v2.0</span>
                    <span>open-Beta</span>
                    {/* <span>Bugs are to be expected, please report them to lambda.nvat@gmail.com</span> */}
                    {/* <span>🇻🇳 🇬🇧</span> */}
                    <span className="bugs" onClick={() => this.handleOpen()}>Bugs 🐞</span>
                </Container>


                <Modal show={this.state.show} onHide={() => this.handleClose()} centered>
                    <Modal.Header>
                    <Modal.Title className="flex-center">
                        <VscBug/> Bugs Season <VscBug/>
                    </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        🐞 Đây là phiên bản beta của bkdnOJ v2.0 vẫn trong quá trình phát triển nên chắc chắn sẽ tồn tại bugs nhiều hình thái, đôi khi rất quái gở.
                        Mong nhận được sự thông cảm của mọi người.
                        <br/> <br/>
                        🐞 Để báo cáo bugs, tạo <strong>New Issue</strong> tại <a href={github}>Github này</a> và
                        đính kèm ảnh/video bug, mô tả bug, nêu những bước để tái hiện bug đó. Xin cảm ơn các bạn đã chung tay giúp cho bkdnOJ-v2 hoàn thiện hơn.
                        <br/>
                        <sub style={{float: "right"}}>🐞🐞🐞</sub>
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="secondary" onClick={() => this.handleClose()}>
                        Close
                    </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}
