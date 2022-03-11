import { useState, useRef } from "react";
import { ButtonBase, Box, Menu, MenuItem, Typography } from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";
import { Wallet } from "../../wallet/Wallet";
import { NETWORKS } from "../../wallet/Networks";

export const SelectNetwork: React.FC<{ wallet?: Wallet }> = ({ wallet }) => {
    const anchor = useRef<any>(null);
    const [open, setOpen] = useState(false);

    return <>
        <ButtonBase ref={anchor} onClick={(e) => setOpen(true)} sx={{
            px: 1, py: 0.5, border: '1px solid #ececec',
            display: 'flex', alignItems: 'center',
            width: '10rem', borderRadius: '8px'
        }}>
            <Box bgcolor={wallet?.network.color} borderRadius='100%'
                width={10} height={10} mr={1}
            ></Box>

            <Typography variant='body2' noWrap sx={{ mr: 'auto' }}>
                {wallet?.network.name}
            </Typography>

            <KeyboardArrowDown />
        </ButtonBase>

        <Menu
            anchorEl={anchor.current} open={open}
            onClose={() => setOpen(false)}
        >
            {Object.keys(NETWORKS).map((key) => (
                <MenuItem key={key}
                    sx={{ width: '10rem' }}
                    onClick={() => {
                        console.log(NETWORKS[key]);
                        setOpen(false);
                    }}>
                    {key}
                </MenuItem>
            ))}
        </Menu>
    </>
}
